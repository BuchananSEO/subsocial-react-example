import { SpaceData, ProfileData } from '@subsocial/types/dto';

export enum CardEditType {
  Space = 'Space',
  Profile = 'Profile',
  Post = 'Post',
  Comment = 'Comment',
}

export interface CardEditProps {
  spaceData?: SpaceData;
  profileData?: ProfileData;
  title: string;
  cancelButton: string;
  saveButton: string;
  onCancel?: () => void;
  type: CardEditType;
}
