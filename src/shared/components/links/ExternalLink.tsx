import * as React from 'react';
import { ButtonProps, ButtonVariant, Icon } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import { css } from '@patternfly/react-styles';
import AnalyticsButton from '../../../components/AnalyticsButton/AnalyticsButton';
import { AnalyticsButtonProperties } from '../../../utils/analytics';
import './ExternalLink.scss';

type ExternalLinkProps = {
  href: string;
  text?: React.ReactNode;
  additionalClassName?: string;
  dataTestID?: string;
  stopPropagation?: boolean;
  style?: React.CSSProperties;
  hideIcon?: boolean;
  variant?: ButtonProps['variant'];
  icon?: ButtonProps['icon'];
  isInline?: boolean;
  onClick?: ButtonProps['onClick'];
  analytics?: AnalyticsButtonProperties;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isHighlightable?: boolean;
};

const ExternalLink: React.FC<React.PropsWithChildren<ExternalLinkProps>> = ({
  children,
  href,
  text,
  additionalClassName = '',
  dataTestID,
  stopPropagation,
  style,
  hideIcon,
  variant = ButtonVariant.link,
  isInline = true,
  icon,
  onClick,
  size = 'sm',
  isHighlightable,
}) => (
  <AnalyticsButton
    component="a"
    style={style}
    className={css(additionalClassName, isHighlightable && 'highlightable-link')}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    data-test={dataTestID}
    isInline={isInline}
    variant={variant}
    icon={icon}
    onClick={(e) => {
      if (stopPropagation) {
        e.stopPropagation();
      }
      onClick?.(e);
    }}
  >
    {children || text}
    {!hideIcon ? (
      <>
        {' '}
        <Icon iconSize={size}>
          <ExternalLinkAltIcon />
        </Icon>
      </>
    ) : null}
  </AnalyticsButton>
);

export default ExternalLink;
