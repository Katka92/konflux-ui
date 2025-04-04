import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import { INTEGRATION_TEST_DETAILS_PATH, INTEGRATION_TEST_LIST_PATH } from '../../../routes/paths';
import { useNamespace } from '../../../shared/providers/Namespace';
import { IntegrationTestScenarioKind } from '../../../types/coreBuildService';
import { useTrackEvent, TrackEvents } from '../../../utils/analytics';
import { defaultSelectedContextOption } from '../utils/creation-utils';
import IntegrationTestForm from './IntegrationTestForm';
import { IntegrationTestFormValues, IntegrationTestLabels } from './types';
import {
  editIntegrationTest,
  createIntegrationTest,
  ResolverRefParams,
} from './utils/create-utils';
import { integrationTestValidationSchema } from './utils/validation-utils';

type IntegrationTestViewProps = {
  applicationName: string;
  integrationTest?: IntegrationTestScenarioKind;
};

interface FormContext {
  name: string;
  description: string;
  selected?: boolean;
}

export const getFormContextValues = (
  integrateTest: IntegrationTestScenarioKind | null | undefined,
): FormContext[] => {
  const contexts = integrateTest?.spec?.contexts;
  // NOTE: If this is a new integration test,
  // have the 'application' context selected by default.
  if (!integrateTest) {
    return [defaultSelectedContextOption];
  } else if (!contexts?.length) {
    return [];
  }

  return contexts.map((context) => {
    return context.name ? { name: context.name, description: context.description } : context;
  });
};

const IntegrationTestView: React.FunctionComponent<
  React.PropsWithChildren<IntegrationTestViewProps>
> = ({ applicationName, integrationTest }) => {
  const track = useTrackEvent();
  const navigate = useNavigate();
  const namespace = useNamespace();

  const url = integrationTest?.spec.resolverRef?.params?.find(
    (param) => param.name === ResolverRefParams.URL,
  );

  const revision = integrationTest?.spec.resolverRef?.params?.find(
    (param) => param.name === ResolverRefParams.REVISION,
  );

  const path = integrationTest?.spec.resolverRef?.params?.find(
    (param) => param.name === ResolverRefParams.PATH,
  );

  const getFormParamValues = (params) => {
    if (!params || !Array.isArray(params) || params?.length === 0) {
      return [];
    }
    const formParams = [];
    params.forEach((param) => {
      if (param.value) {
        formParams.push({ name: param.name, values: [param.value] });
      } else {
        formParams.push(param);
      }
    });
    return formParams;
  };

  const initialValues = {
    integrationTest: {
      name: integrationTest?.metadata.name ?? '',
      url: url?.value ?? '',
      revision: revision?.value ?? '',
      path: path?.value ?? '',
      params: getFormParamValues(integrationTest?.spec?.params),
      contexts: getFormContextValues(integrationTest),
      optional: integrationTest?.metadata.labels?.[IntegrationTestLabels.OPTIONAL] === 'true',
    },
    isDetected: true,
  };

  const handleSubmit = (values, actions) => {
    if (integrationTest) {
      track(TrackEvents.ButtonClicked, {
        link_name: 'edit-integration-test-submit',
        app_name: integrationTest.spec.application,
        integration_test_name: integrationTest.metadata.name,
      });
    } else {
      track(TrackEvents.ButtonClicked, {
        link_name: 'add-integration-test-submit',
        app_name: applicationName,
      });
    }
    return (
      integrationTest
        ? editIntegrationTest(integrationTest, values.integrationTest as IntegrationTestFormValues)
        : createIntegrationTest(
            values.integrationTest as IntegrationTestFormValues,
            applicationName,
            namespace,
          )
    )
      .then((newIntegrationTest) => {
        track(integrationTest ? 'Integration test Edited' : 'Integration test Created', {
          app_name: newIntegrationTest.spec.application,
          integration_test_name: newIntegrationTest.metadata.name,
          bundle: newIntegrationTest.spec.bundle,
          pipeline: newIntegrationTest.spec.pipeline,
        });
        if (integrationTest) {
          if (window.history.state && window.history.state.idx > 0) {
            // go back to the page where the edit was launched
            navigate(-1);
          } else {
            navigate(
              INTEGRATION_TEST_DETAILS_PATH.createPath({
                applicationName,
                integrationTestName: integrationTest.metadata?.name,
                workspaceName: namespace,
              }),
            );
          }
        } else {
          navigate(
            INTEGRATION_TEST_LIST_PATH.createPath({ applicationName, workspaceName: namespace }),
          );
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.warn('Error while submitting integration test:', error);
        actions.setSubmitting(false);
        actions.setStatus({ submitError: error.message });
      });
  };

  return (
    <Formik
      onSubmit={handleSubmit}
      onReset={() => {
        if (integrationTest) {
          track(TrackEvents.ButtonClicked, {
            link_name: 'edit-integration-test-leave',
            app_name: integrationTest.spec.application,
            integration_test_name: integrationTest.metadata.name,
          });
        } else {
          track(TrackEvents.ButtonClicked, {
            link_name: 'add-integration-test-leave',
            app_name: applicationName,
          });
        }
        navigate(-1);
      }}
      initialValues={initialValues}
      validationSchema={integrationTestValidationSchema}
    >
      {(props) => (
        <IntegrationTestForm
          {...props}
          applicationName={applicationName}
          edit={!!integrationTest}
        />
      )}
    </Formik>
  );
};

export default IntegrationTestView;
