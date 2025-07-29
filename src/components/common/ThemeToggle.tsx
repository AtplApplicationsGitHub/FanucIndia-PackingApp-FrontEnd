'use client';

import * as React from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ComputerIcon from '@mui/icons-material/Computer';
import { ColorModeContext, ColorMode } from '@/lib/color-mode-context';

export function ThemeToggle() {
  const { mode, setMode } = React.useContext(ColorModeContext);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (value: ColorMode) => {
    setMode(value);
    setAnchorEl(null);
  };

  let icon;
  if (mode === 'light') icon = <LightModeIcon />;
  else if (mode === 'dark') icon = <DarkModeIcon />;
  else icon = <ComputerIcon />;

  return (
    <>
      <Tooltip title="Theme">
        <IconButton color="inherit" onClick={handleClick} aria-label="toggle theme">
          {icon}
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem selected={mode === 'light'} onClick={() => handleChange('light')}>
          <ListItemIcon><LightModeIcon /></ListItemIcon>
          <ListItemText>Light</ListItemText>
        </MenuItem>
        <MenuItem selected={mode === 'dark'} onClick={() => handleChange('dark')}>
          <ListItemIcon><DarkModeIcon /></ListItemIcon>
          <ListItemText>Dark</ListItemText>
        </MenuItem>
        <MenuItem selected={mode === 'system'} onClick={() => handleChange('system')}>
          <ListItemIcon><ComputerIcon /></ListItemIcon>
          <ListItemText>System</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
