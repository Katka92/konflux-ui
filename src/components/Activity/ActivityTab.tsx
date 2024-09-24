import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tab, Tabs, TabTitleText, Text, Title } from '@patternfly/react-core';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { RouterParams } from '../../routes/utils';
import CommitsListView from '../Commits/CommitsListPage/CommitsListView';
import PipelineRunsTab from './PipelineRunsTab';

import './ActivityTab.scss';

export const ACTIVITY_SECONDARY_TAB_KEY = 'activity-secondary-tab';

export const ActivityTab: React.FC<React.PropsWithChildren<{ applicationName?: string }>> = () => {
  const params = useParams<RouterParams>();
  const { applicationName, workspaceName, activityTab } = params;
  const [lastSelectedTab, setLocalStorageItem] = useLocalStorage<string>(
    ACTIVITY_SECONDARY_TAB_KEY,
  );
  const currentTab = activityTab || lastSelectedTab || 'latest-commits';

  const getActivityTabRoute = React.useCallback(
    (tab: string) => `/workspaces/${workspaceName}/applications/${applicationName}/activity/${tab}`,
    [applicationName, workspaceName],
  );

  const navigate = useNavigate();
  const setActiveTab = React.useCallback(
    (newTab: string) => {
      if (currentTab !== newTab) {
        navigate(getActivityTabRoute(newTab));
      }
    },
    [currentTab, getActivityTabRoute, navigate],
  );

  React.useEffect(() => {
    if (activityTab !== lastSelectedTab) {
      setLocalStorageItem(currentTab);
    }
  }, [activityTab, lastSelectedTab, currentTab, setLocalStorageItem]);

  React.useEffect(() => {
    if (!activityTab && lastSelectedTab) {
      navigate(getActivityTabRoute(lastSelectedTab), { replace: true });
    }
  }, [activityTab, getActivityTabRoute, lastSelectedTab, navigate]);

  return (
    <>
      <Title size="xl" headingLevel="h3" className="pf-v5-c-title pf-v5-u-mt-lg pf-v5-u-mb-sm">
        Activity By
      </Title>
      <Text className="pf-v5-u-mb-sm">
        Monitor your commits and their pipeline progression across all components.
      </Text>
      <Tabs
        style={{
          width: 'fit-content',
          marginBottom: 'var(--pf-v5-global--spacer--md)',
        }}
        activeKey={currentTab}
        onSelect={(_, k: string) => {
          setActiveTab(k);
        }}
        data-testid="activities-tabs-id"
        mountOnEnter
        unmountOnExit
      >
        <Tab
          data-testid={`activity__tabItem latest-commits`}
          title={<TabTitleText>Latest commits</TabTitleText>}
          key="latest-commits"
          eventKey="latest-commits"
          className="activity-tab"
        >
          <CommitsListView applicationName={applicationName} />
        </Tab>
        <Tab
          data-testid={`activity__tabItem pipelineruns`}
          title={<TabTitleText>Pipeline runs</TabTitleText>}
          key="pipelineruns"
          eventKey="pipelineruns"
          className="activity-tab"
        >
          <PipelineRunsTab applicationName={applicationName} />
        </Tab>
      </Tabs>
    </>
  );
};
