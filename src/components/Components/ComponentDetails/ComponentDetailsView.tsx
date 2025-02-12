import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Bullseye,
  Button,
  ButtonVariant,
  Spinner,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import pipelineImg from '../../../assets/Pipeline.svg';
import { useComponent } from '../../../hooks/useComponents';
import { HttpError } from '../../../k8s/error';
import { ComponentGroupVersionKind } from '../../../models';
import { RouterParams } from '../../../routes/utils';
import ErrorEmptyState from '../../../shared/components/empty-state/ErrorEmptyState';
import { useApplicationBreadcrumbs } from '../../../utils/breadcrumb-utils';
import { createCustomizeComponentPipelineModalLauncher } from '../../CustomizedPipeline/CustomizePipelinesModal';
import { DetailsPage } from '../../DetailsPage';
import { Action } from '../../DetailsPage/types';
import { GettingStartedCard } from '../../GettingStartedCard/GettingStartedCard';
import { useModalLauncher } from '../../modal/ModalProvider';
import { useWorkspaceInfo } from '../../Workspace/useWorkspaceInfo';
import { useComponentActions } from '../component-actions';

import './ComponentDetailsView.scss';

export const COMPONENTS_GS_LOCAL_STORAGE_KEY = 'components-getting-started-modal';

const ComponentDetailsView: React.FC = () => {
  const { componentName, applicationName } = useParams<RouterParams>();
  const navigate = useNavigate();
  const { namespace, workspace } = useWorkspaceInfo();
  const applicationBreadcrumbs = useApplicationBreadcrumbs();
  const showModal = useModalLauncher();
  const [component, loaded, componentError] = useComponent(namespace, workspace, componentName);

  const componentActions = useComponentActions(loaded ? component : undefined, componentName);
  const actions: Action[] = React.useMemo(
    () =>
      componentActions.map((compAction) => ({
        key: compAction.id,
        label: compAction.label,
        isDisabled: compAction.disabled,
        disabledTooltip: compAction.disabledTooltip,
        onClick: () => {
          if (isFunction(compAction.cta)) {
            compAction.cta();
          } else if (isObject(compAction.cta)) {
            if (!compAction.cta.external) {
              navigate(compAction.cta.href);
            }
          }
        },
      })),
    [componentActions, navigate],
  );

  if (componentError || (loaded && !component)) {
    return (
      <ErrorEmptyState
        httpError={HttpError.fromCode(
          componentError ? (componentError as { code: number }).code : 404,
        )}
        title={`Could not load ${ComponentGroupVersionKind.kind}`}
        body={(componentError as { message?: string })?.message ?? 'Not found'}
      />
    );
  }

  if (!loaded) {
    return (
      <Bullseye>
        <Spinner data-test="spinner" />
      </Bullseye>
    );
  }

  return (
    <>
      <DetailsPage
        data-test="component-details-test-id"
        headTitle={component.spec.componentName}
        preComponent={
          <GettingStartedCard
            imgClassName="component-details__gs-image"
            localStorageKey={COMPONENTS_GS_LOCAL_STORAGE_KEY}
            title="For maximum security, upgrade the build pipeline plans for your component."
            imgSrc={pipelineImg}
            imgAlt="build pipeline plans"
            isLight
          >
            <div>
              Using the Advanced or Custom build pipeline, you can enable all additional tasks for
              added security.
            </div>
            <Button
              className="pf-u-mt-xl"
              variant={ButtonVariant.secondary}
              onClick={() =>
                showModal(
                  createCustomizeComponentPipelineModalLauncher(
                    component.metadata.name,
                    component.metadata.namespace,
                  ),
                )
              }
            >
              Edit build pipeline plan
            </Button>
          </GettingStartedCard>
        }
        breadcrumbs={[
          ...applicationBreadcrumbs,
          {
            path: `/workspaces/${workspace}/applications/${applicationName}/components`,
            name: 'components',
          },
          {
            path: `/workspaces/${workspace}/applications/${applicationName}/components/${componentName}`,
            name: component.spec.componentName,
          },
        ]}
        title={
          <Text component={TextVariants.h2}>
            <span className="pf-u-mr-sm">
              <b>{component.spec.componentName}</b>
            </span>
          </Text>
        }
        actions={actions}
        baseURL={`/workspaces/${workspace}/applications/${applicationName}/components/${componentName}`}
        tabs={[
          {
            key: 'index',
            label: 'Component details',
            isFilled: true,
          },
          {
            key: 'activity',
            label: 'Activity',
          },
        ]}
      />
    </>
  );
};

export default ComponentDetailsView;
