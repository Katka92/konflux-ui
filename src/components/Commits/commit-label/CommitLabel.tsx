import * as React from 'react';
import { Label, Tooltip } from '@patternfly/react-core';
import { BitbucketIcon } from '@patternfly/react-icons/dist/esm/icons/bitbucket-icon';
import { GithubIcon } from '@patternfly/react-icons/dist/esm/icons/github-icon';
import { GitlabIcon } from '@patternfly/react-icons/dist/esm/icons/gitlab-icon';
import { css } from '@patternfly/react-styles';
import { GitProvider } from '../../../shared/utils/git-utils';
import { getCommitShortName } from '../../../utils/commits-utils';

import './CommitLabel.scss';

const tipText = {
  [GitProvider.GITHUB]: 'Open in GitHub',
  [GitProvider.GITLAB]: 'Open in GitLab',
  [GitProvider.BITBUCKET]: 'Open in BitBucket',
};
const providerIcon = {
  [GitProvider.GITHUB]: <GithubIcon data-test="git-hub-icon" />,
  [GitProvider.GITLAB]: <GitlabIcon data-test="git-lab-icon" />,
  [GitProvider.BITBUCKET]: <BitbucketIcon data-test="bit-bucket-icon" />,
};

type CommitLabelProps = {
  gitProvider: GitProvider | string;
  sha: string;
  shaURL: string;
};
const CommitLabel: React.FC<React.PropsWithChildren<CommitLabelProps>> = ({
  gitProvider,
  sha,
  shaURL,
}) => {
  const commitShortName = getCommitShortName(sha);
  const label = (
    <Label
      color="blue"
      className={css('commit-label', gitProvider === GitProvider.GITHUB && 'black-icon')}
      icon={providerIcon[gitProvider]}
      isCompact
      render={({ className, content }) => (
        <a
          href={shaURL}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          data-test={`commit-label-${commitShortName}`}
        >
          {content}
        </a>
      )}
    >
      {commitShortName}
    </Label>
  );
  const tooltip = tipText[gitProvider];
  if (tooltip) {
    return <Tooltip content={tooltip}>{label}</Tooltip>;
  }
  return label;
};

export default CommitLabel;
