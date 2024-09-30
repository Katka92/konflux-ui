import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useTaskRun } from '../../../hooks/usePipelineRuns';
import { RouterParams } from '../../../routes/utils';
import { TaskRunKind } from '../../../types';
import { taskRunStatus } from '../../../utils/pipeline-utils';
// import TaskRunLogs from '../../TaskRuns/TaskRunLogs';
import { useWorkspaceInfo } from '../../Workspace/workspace-context';

export type TaskRunLogProps = {
  taskRun: TaskRunKind;
};

const TaskRunLogsTab: React.FC = () => {
  const { taskRunName } = useParams<RouterParams>();
  const { namespace } = useWorkspaceInfo();
  const [taskRun] = useTaskRun(namespace, taskRunName);
  const status = taskRunStatus(taskRun);

  return <div> {status}</div>;
};

export default TaskRunLogsTab;
