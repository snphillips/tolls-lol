import { resolutionLabelColorArrayType } from '../types';

export const determineMarkerColorUtil = (
  resolutionDescription: string,
  resolutionLabelColorArray: resolutionLabelColorArrayType
): string => {
  const resolution = resolutionLabelColorArray.find((res) => res.resolution === resolutionDescription);
  return resolution ? resolution.color : 'white';
};
