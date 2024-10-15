import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
} from '@patternfly/react-core';
import { ElementModel, GraphElement } from '@patternfly/react-topology';
import PipelineIcon from '../../../../assets/pipelineIcon.svg';
import { PipelineRunLabel } from '../../../../consts/pipelinerun';
import { useTaskRuns } from '../../../../hooks/useTaskRuns';
import { Timestamp } from '../../../../shared/components/timestamp/Timestamp';
import { PipelineRunKind } from '../../../../types';
import {
  calculateDuration,
  pipelineRunStatus,
  isPipelineV1Beta1,
} from '../../../../utils/pipeline-utils';
import RunResultsList from '../../../PipelineRun/PipelineRunDetailsView/tabs/RunResultsList';
import ScanDescriptionListGroup from '../../../PipelineRun/PipelineRunDetailsView/tabs/ScanDescriptionListGroup';
import { StatusIconWithTextLabel } from '../../../topology/StatusIcon';
import { useWorkspaceInfo } from '../../../Workspace/useWorkspaceInfo';
import { CommitWorkflowNodeModelData } from '../visualization/commit-visualization-types';

export interface PipelineSidePanelBodyProps {
  onClose: () => void;
  workflowNode: GraphElement<ElementModel, CommitWorkflowNodeModelData>;
}

const BuildSidePanel: React.FC<React.PropsWithChildren<PipelineSidePanelBodyProps>> = ({
  workflowNode,
  onClose,
}) => {
  const { workspace, namespace } = useWorkspaceInfo();
  const workflowData = workflowNode.getData();
  const pipelineRun = workflowData.resource as PipelineRunKind;
  const [taskRuns] = useTaskRuns(namespace, pipelineRun.metadata.name);

  if (!pipelineRun) {
    return null;
  }

  const duration = calculateDuration(
    typeof pipelineRun.status?.startTime === 'string' ? pipelineRun.status?.startTime : '',
    typeof pipelineRun.status?.completionTime === 'string'
      ? pipelineRun.status?.completionTime
      : '',
  );

  const pipelineStatus = pipelineRunStatus(pipelineRun);

  const results = isPipelineV1Beta1(pipelineRun)
    ? pipelineRun.status?.pipelineResults
    : pipelineRun.status?.results;

  return (
    <>
      <div className="commit-side-panel__head">
        <DrawerHead data-testid="build-side-panel-head">
          <span className="commit-side-panel__head-title">
            <Link
              to={`/workspaces/${workspace}/applications/${workflowData.application}/pipelineruns/${pipelineRun.metadata.name}`}
            >
              {pipelineRun.metadata.name}
            </Link>
            <StatusIconWithTextLabel status={workflowNode.getData().status} />
          </span>
          <span className="pf-v5-u-mt-xs commit-side-panel__subtext">
            <img src={PipelineIcon} alt="pipeline run" /> Pipeline run
          </span>
          <DrawerActions>
            <DrawerCloseButton onClick={onClose} />
          </DrawerActions>
        </DrawerHead>
        <DrawerPanelBody data-testid="build-side-panel-body">
          <DescriptionList
            data-test="pipeline-run-details"
            columnModifier={{
              default: '2Col',
            }}
          >
            <DescriptionListGroup>
              <DescriptionListTerm>Created at</DescriptionListTerm>
              <DescriptionListDescription>
                <Timestamp timestamp={pipelineRun.metadata?.creationTimestamp ?? '-'} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Duration</DescriptionListTerm>
              <DescriptionListDescription>{duration ?? '-'}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Type</DescriptionListTerm>
              <DescriptionListDescription>Build</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Pipeline</DescriptionListTerm>
              <DescriptionListDescription>
                {pipelineRun.metadata?.labels[PipelineRunLabel.PIPELINE_NAME] ?? '-'}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
          <DescriptionList
            className="pf-v5-u-mt-lg"
            data-test="pipeline-run-details"
            columnModifier={{
              default: '1Col',
            }}
          >
            <DescriptionListGroup>
              <DescriptionListTerm>Component</DescriptionListTerm>
              <DescriptionListDescription>
                {pipelineRun.metadata?.labels?.[PipelineRunLabel.COMPONENT] ? (
                  pipelineRun.metadata?.labels?.[PipelineRunLabel.APPLICATION] ? (
                    <Link
                      to={`/workspaces/${workspace}/applications/${
                        pipelineRun.metadata.labels[PipelineRunLabel.APPLICATION]
                      }/components/${pipelineRun.metadata.labels[PipelineRunLabel.COMPONENT]}`}
                    >
                      {pipelineRun.metadata.labels[PipelineRunLabel.COMPONENT]}
                    </Link>
                  ) : (
                    pipelineRun.metadata.labels[PipelineRunLabel.COMPONENT]
                  )
                ) : (
                  '-'
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <ScanDescriptionListGroup taskRuns={taskRuns} hideIfNotFound />
            <DescriptionListGroup>
              <DescriptionListDescription>
                <Link
                  to={`/workspaces/${workspace}/applications/${workflowData.application}/pipelineruns/${pipelineRun.metadata.name}/logs`}
                >
                  View logs
                </Link>
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
          {results ? (
            <div className="pf-v5-u-mt-lg">
              <RunResultsList results={results} status={pipelineStatus} compressed />
            </div>
          ) : null}
        </DrawerPanelBody>
      </div>
    </>
  );
};

export default BuildSidePanel;
