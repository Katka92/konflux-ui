import { fireEvent, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useApplications } from '../../../../hooks/useApplications';
import { createK8sWatchResourceMock, renderWithQueryClient } from '../../../../utils/test-utils';
import { mockApplication } from '../../../ApplicationDetails/__data__/mock-data';
import { WorkspaceContext } from '../../../Workspace/workspace-context';
import { MockIntegrationTestsWithGit } from '../../IntegrationTestsListView/__data__/mock-integration-tests';
import IntegrationTestView from '../IntegrationTestView';
import { createIntegrationTest } from '../utils/create-utils';

jest.mock('../../../../utils/analytics');

const watchResourceMock = createK8sWatchResourceMock();

const navigateMock = jest.fn();

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(() => ({})),
  Link: (props) => <a href={props.to}>{props.children}</a>,
  useNavigate: () => navigateMock,
  useParams: jest.fn(() => ({
    appName: 'test-app',
  })),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({ t: (x) => x })),
}));

jest.mock('../utils/create-utils.ts', () => {
  const actual = jest.requireActual('../utils/create-utils.ts');
  return {
    ...actual,
    createIntegrationTest: jest.fn(),
  };
});

jest.mock('../../../../hooks/useApplications', () => ({
  useApplications: jest.fn(),
}));

jest.mock('../../../../utils/rbac', () => ({
  useAccessReviewForModel: jest.fn(() => [true, true]),
}));

const createIntegrationTestMock = createIntegrationTest as jest.Mock;

class MockResizeObserver {
  observe() {
    // do nothing
  }

  unobserve() {
    // do nothing
  }

  disconnect() {
    // do nothing
  }
}

window.ResizeObserver = MockResizeObserver;

const IntegrationTestViewWrapper = ({ children }) => (
  <WorkspaceContext.Provider
    value={{
      namespace: 'test-ns',
      lastUsedWorkspace: 'test-ws',
      workspace: 'test-ws',
      workspaceResource: undefined,
      workspacesLoaded: true,
      workspaces: [],
    }}
  >
    {children}
  </WorkspaceContext.Provider>
);

const useApplicationsMock = useApplications as jest.Mock;

describe('IntegrationTestView', () => {
  beforeEach(() => {
    useApplicationsMock.mockReturnValue([[mockApplication], true]);
    watchResourceMock.mockReturnValue([[], true]);
  });
  const fillIntegrationTestForm = (wrapper: RenderResult) => {
    fireEvent.input(wrapper.getByLabelText(/Integration test name/), {
      target: { value: 'new-test-name' },
    });
    fireEvent.input(wrapper.getByLabelText(/GitHub URL/), {
      target: { value: 'quay.io/kpavic/test-bundle:pipeline' },
    });
    fireEvent.input(wrapper.getByLabelText(/Revision/), {
      target: { value: 'new-test-pipeline' },
    });
    fireEvent.input(wrapper.getByLabelText(/Path in repository/), {
      target: { value: 'new-test-pipeline' },
    });
  };
  it('should render the form by default', () => {
    const wrapper = renderWithQueryClient(
      <IntegrationTestViewWrapper>
        <IntegrationTestView applicationName="test-app" />
      </IntegrationTestViewWrapper>,
    );
    expect(wrapper).toBeTruthy();

    wrapper.getByLabelText(/Integration test name/);
    wrapper.getByLabelText(/GitHub URL/);
    wrapper.getByLabelText(/Revision/);
    wrapper.getByLabelText(/Path in repository/);
    wrapper.getByRole('button', { name: 'Add integration test' });
  });

  it('should enable the submit button when there are no errors', () => {
    const wrapper = renderWithQueryClient(
      <IntegrationTestViewWrapper>
        <IntegrationTestView applicationName="test-app" />
      </IntegrationTestViewWrapper>,
    );
    expect(wrapper).toBeTruthy();

    const submitButton = wrapper.getByRole('button', { name: 'Add integration test' });
    expect(submitButton).toBeDisabled();
    fillIntegrationTestForm(wrapper);
    expect(submitButton).toBeEnabled();
  });

  it('should navigate to the integration test tab on submit', () => {
    createIntegrationTestMock.mockImplementation(() =>
      Promise.resolve({
        metadata: {},
        spec: {},
      }),
    );
    const wrapper = renderWithQueryClient(
      <IntegrationTestViewWrapper>
        <IntegrationTestView applicationName="test-app" />
      </IntegrationTestViewWrapper>,
    );
    expect(wrapper).toBeTruthy();

    fillIntegrationTestForm(wrapper);

    const submitButton = wrapper.getByRole('button', { name: 'Add integration test' });
    expect(submitButton).toBeTruthy();
    expect(submitButton).toBeEnabled();
  });

  it('should init values from provided integration test', () => {
    const integrationTest = MockIntegrationTestsWithGit[1];
    const wrapper = renderWithQueryClient(
      <IntegrationTestViewWrapper>
        <IntegrationTestView applicationName="test-app" integrationTest={integrationTest} />,
      </IntegrationTestViewWrapper>,
    );

    expect(wrapper.getByLabelText(/Integration test name/).getAttribute('value')).toBe(
      'test-app-test-2',
    );
    expect(wrapper.getByLabelText(/GitHub URL/).getAttribute('value')).toEqual('test-url2');
    expect(wrapper.getByLabelText(/Revision/).getAttribute('value')).toEqual('main2');

    expect(wrapper.getByLabelText(/Path in repository/).getAttribute('value')).toEqual(
      'test-path2',
    );
  });

  it('should be in edit mode', () => {
    const integrationTest = MockIntegrationTestsWithGit[1];
    const wrapper = renderWithQueryClient(
      <IntegrationTestViewWrapper>
        <IntegrationTestView applicationName="test-app" integrationTest={integrationTest} />
      </IntegrationTestViewWrapper>,
    );

    expect((wrapper.getByText(/Save changes/) as HTMLButtonElement).disabled).toBe(true);
    wrapper.getByLabelText(/Integration test name/).setAttribute('value', 'new value');
  });
});
