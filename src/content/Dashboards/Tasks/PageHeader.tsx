import {
  Typography,
  Button,
  Box,
  alpha,
  lighten,
  Avatar,
  styled
} from '@mui/material';
import DocumentScannerTwoToneIcon from '@mui/icons-material/DocumentScannerTwoTone';
import AddAlertTwoToneIcon from '@mui/icons-material/AddAlertTwoTone';

const AvatarPageTitle = styled(Avatar)(
  ({ theme }) => `
      width: ${theme.spacing(8)};
      height: ${theme.spacing(8)};
      color: ${theme.colors.primary.main};
      margin-right: ${theme.spacing(2)};
      background: ${
        theme.palette.mode === 'dark'
          ? theme.colors.alpha.trueWhite[10]
          : theme.colors.alpha.white[50]
      };
      box-shadow: ${
        theme.palette.mode === 'dark'
          ? '0 1px 0 ' +
            alpha(lighten(theme.colors.primary.main, 0.8), 0.2) +
            ', 0px 2px 4px -3px rgba(0, 0, 0, 0.3), 0px 5px 16px -4px rgba(0, 0, 0, .5)'
          : '0px 2px 4px -3px ' +
            alpha(theme.colors.alpha.black[100], 0.4) +
            ', 0px 5px 16px -4px ' +
            alpha(theme.colors.alpha.black[100], 0.2)
      };
`
);

function PageHeader() {
  const user = {
    name: 'Catherine Pike',
    avatar: '/static/images/avatars/1.jpg'
  };

  return (
    <Box
      display="flex"
      alignItems={{ xs: 'stretch', md: 'center' }}
      flexDirection={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
    >
      <Box display="flex" alignItems="center">
        <AvatarPageTitle variant="rounded">
          <AddAlertTwoToneIcon fontSize="large" />
        </AvatarPageTitle>
        <Box>
          <Typography variant="h3" component="h3" gutterBottom>
            Welcome, {user.name}!
          </Typography>
          <Typography variant="subtitle2">
            Manage your day to day tasks with style! Enjoy a well built UI
            system.
          </Typography>
        </Box>
      </Box>
      <Box mt={{ xs: 3, md: 0 }}>
        <Button variant="contained" startIcon={<DocumentScannerTwoToneIcon />}>
          Export
        </Button>
      </Box>
    </Box>
  );
}

export default PageHeader;
