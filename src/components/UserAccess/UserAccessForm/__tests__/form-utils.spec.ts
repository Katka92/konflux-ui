import '@testing-library/jest-dom';
import { createK8sUtilMock } from '../../../../utils/test-utils';
import { createSBRs, editSBR, validateUsername } from '../form-utils';

const k8sCreateMock = createK8sUtilMock('K8sQueryCreateResource');
const k8sPatchMock = createK8sUtilMock('K8sQueryPatchResource');

describe('createSBRs', () => {
  it('should create SBRs for all usernames', async () => {
    k8sCreateMock.mockImplementation((obj) => obj.resource);
    const result = await createSBRs(
      { usernames: ['user1', 'user2', 'user3'], role: 'maintainer' },
      'test-ns',
    );

    expect(k8sCreateMock).toHaveBeenCalledTimes(3);
    expect(result).toEqual([
      expect.objectContaining({
        metadata: { generateName: 'user1-', namespace: 'test-ns' },
        spec: { masterUserRecord: 'user1', spaceRole: 'maintainer' },
      }),
      expect.objectContaining({
        metadata: { generateName: 'user2-', namespace: 'test-ns' },
        spec: { masterUserRecord: 'user2', spaceRole: 'maintainer' },
      }),
      expect.objectContaining({
        metadata: { generateName: 'user3-', namespace: 'test-ns' },
        spec: { masterUserRecord: 'user3', spaceRole: 'maintainer' },
      }),
    ]);
  });
});

describe('editSBR', () => {
  it('should patch SBR with new role', async () => {
    k8sPatchMock.mockResolvedValue({});
    const result = await editSBR(
      { usernames: ['user1'], role: 'contributor' },
      {
        apiVersion: 'v1alpha1',
        kind: 'SpaceBindingRequest',
        metadata: { name: 'user1' },
        spec: { masterUserRecord: 'user1', spaceRole: 'maintainer' },
      },
    );
    expect(result).toEqual([{}]);
    expect(k8sPatchMock).toHaveBeenCalledTimes(1);
    expect(k8sPatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        patches: [{ op: 'replace', path: '/spec/spaceRole', value: 'contributor' }],
      }),
    );
  });
});

describe('validateUsername', () => {
  const mockFetch = jest.fn();
  beforeAll(() => {
    window.fetch = mockFetch;
  });

  it('should return true if username is valid', async () => {
    mockFetch.mockResolvedValue({
      json: () => [
        {
          username: 'user1',
        },
      ],
    });
    const result = await validateUsername('user1');
    expect(mockFetch).toHaveBeenCalledWith('/api/k8s/registration/api/v1/usernames/user1');
    expect(result).toBe(true);
  });

  it('should return false if returned username is not the same', async () => {
    mockFetch.mockResolvedValue({
      json: () => {
        'user';
      },
    });
    const result = await validateUsername('user1');
    expect(result).toBe(false);
  });

  it('should return false if api call fails', async () => {
    mockFetch.mockRejectedValue(null);
    const result = await validateUsername('user1');
    expect(result).toBe(false);
  });
});
