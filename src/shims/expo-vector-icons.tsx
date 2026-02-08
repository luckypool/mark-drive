import React from 'react';
import type { IconType } from 'react-icons';
import {
  IoAddCircleOutline,
  IoAlertCircle,
  IoAlertCircleOutline,
  IoArrowBack,
  IoArrowForward,
  IoCheckmarkCircle,
  IoChevronBack,
  IoChevronDown,
  IoChevronForward,
  IoClose,
  IoCodeSlashOutline,
  IoColorPaletteOutline,
  IoContractOutline,
  IoCreateOutline,
  IoDocumentOutline,
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoExpandOutline,
  IoEyeOutline,
  IoFlashOutline,
  IoFolderOutline,
  IoGitNetworkOutline,
  IoInformationCircleOutline,
  IoLibraryOutline,
  IoLockClosedOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoLogoGithub,
  IoLogoGoogle,
  IoMenu,
  IoMoonOutline,
  IoOpenOutline,
  IoPerson,
  IoPhonePortraitOutline,
  IoSaveOutline,
  IoSearch,
  IoSearchOutline,
  IoShareOutline,
  IoShieldCheckmarkOutline,
  IoSunnyOutline,
  IoTimeOutline,
} from 'react-icons/io5';

const iconMap: Record<string, IconType> = {
  'add-circle-outline': IoAddCircleOutline,
  'alert-circle': IoAlertCircle,
  'alert-circle-outline': IoAlertCircleOutline,
  'arrow-back': IoArrowBack,
  'arrow-forward': IoArrowForward,
  'checkmark-circle': IoCheckmarkCircle,
  'chevron-back': IoChevronBack,
  'chevron-down': IoChevronDown,
  'chevron-forward': IoChevronForward,
  'close': IoClose,
  'code-slash-outline': IoCodeSlashOutline,
  'color-palette-outline': IoColorPaletteOutline,
  'contract-outline': IoContractOutline,
  'create-outline': IoCreateOutline,
  'document-outline': IoDocumentOutline,
  'document-text-outline': IoDocumentTextOutline,
  'download-outline': IoDownloadOutline,
  'expand-outline': IoExpandOutline,
  'eye-outline': IoEyeOutline,
  'flash-outline': IoFlashOutline,
  'folder-outline': IoFolderOutline,
  'git-network-outline': IoGitNetworkOutline,
  'information-circle-outline': IoInformationCircleOutline,
  'library-outline': IoLibraryOutline,
  'lock-closed-outline': IoLockClosedOutline,
  'log-in-outline': IoLogInOutline,
  'log-out-outline': IoLogOutOutline,
  'logo-github': IoLogoGithub,
  'logo-google': IoLogoGoogle,
  'menu': IoMenu,
  'moon-outline': IoMoonOutline,
  'open-outline': IoOpenOutline,
  'person': IoPerson,
  'phone-portrait-outline': IoPhonePortraitOutline,
  'save-outline': IoSaveOutline,
  'search': IoSearch,
  'search-outline': IoSearchOutline,
  'share-outline': IoShareOutline,
  'shield-checkmark-outline': IoShieldCheckmarkOutline,
  'sunny-outline': IoSunnyOutline,
  'time-outline': IoTimeOutline,
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

function Ionicons({ name, size = 24, color = '#000', style }: IconProps) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon size={size} color={color} style={style} />;
}

// Maintain glyphMap for app/ type compatibility
Ionicons.glyphMap = Object.fromEntries(
  Object.keys(iconMap).map((key) => [key, 0])
) as Record<string, number>;

export { Ionicons };
export default { Ionicons };
