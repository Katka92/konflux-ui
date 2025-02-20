import { render } from '@testing-library/react';
import { ReleaseCondition } from '../../../types';
import ReleasesListRow from '../ReleasesListRow';

jest.mock('react-router-dom', () => ({
  Link: (props) => <a href={props.to}>{props.children}</a>,
}));

const mockRelease = {
  apiVersion: 'appstudio.redhat.com/v1alpha1',
  kind: 'Release',
  metadata: {
    name: 'test-release',
    creationTimestamp: '2023-01-20T14:13:29Z',
  },
  spec: {
    releasePlan: 'test-plan',
    snapshot: 'test-snapshot',
  },
  status: {
    conditions: [
      {
        reason: 'Succeeded',
        status: 'True',
        type: ReleaseCondition.Released,
      },
    ],
  },
};

describe('ReleasesListRow', () => {
  it('should render release info', () => {
    const wrapper = render(
      <ReleasesListRow
        obj={mockRelease}
        columns={[]}
        customData={{ applicationName: 'test-app' }}
      />,
      {
        container: document.createElement('tr'),
      },
    );
    const cells = wrapper.container.getElementsByTagName('td');
    const status = wrapper.getAllByTestId('release-status');

    expect(cells[0].children[0].innerHTML).toBe(mockRelease.metadata.name);
    expect(cells[3].innerHTML).toBe('test-plan');
    expect(cells[4].innerHTML).toBe(
      '<a href="/workspaces//applications/test-app/snapshots/test-snapshot">test-snapshot</a>',
    );
    expect(status[0].innerHTML).toBe('Succeeded');
  });
});
