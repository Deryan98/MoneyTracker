import { ColorType } from "@constants/colors/colors";

export interface HeadingsProps {
  children: string;
  headingSize: 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6';
  color?: ColorType
}