import { styled, TextField, Select, LinearProgress, linearProgressClasses, CircularProgress } from '@mui/material';
import { Box } from '@mui/material';

export const CustomTextField = styled(TextField)(({ }) => ({
  '& label': {
    color: '#8C8A8A',
    fontFamily: "Inter",
    fontSize: '.65vw',
    '@media (max-width: 600px)': {
      fontSize: '3vw',
    },
    '@media (min-width: 650px) and (max-width: 2000px)': {
      fontSize: '13px',
    },
    '@media (min-width: 499px) and (max-width: 650px)': { 
      fontSize: '13px',
    },
    '@media screen and (max-width: 499px)': {
      fontSize: '12px'
    }
  },
  '& label.Mui-focused': {
    color: '#EC4A27',
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'White !important',
    borderRadius: '10px',

    '& fieldset': {
      border: '2px solid #E0E0E0',
      borderRadius: '10px',
    },
    '&:hover fieldset': {
      borderColor: '#C4CCCF',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#EC4A27',
    },
    '& input': {
      fontFamily: 'Inter',
      color: 'black !important',
      backgroundColor: 'White !important',
      borderRadius: '10px',
      fontSize: '.65vw',
      '@media (max-width: 600px)': {
        fontSize: '2.6vw',
      },
      '@media (min-width: 650px) and (max-width: 2000px)': {
        fontSize: '12px',
      },
      '@media (min-width: 499px) and (max-width: 650px)': { 
        fontSize: '10px',
      },
      '@media screen and (max-width: 499px)': {
        fontSize: '10px'
      }
    },
  },
}));

export const CustomDropdown = styled(Select)({
  backgroundColor: 'white !important',
  borderRadius: '10px',
  '& .MuiOutlinedInput-notchedOutline': {
    border: '2px solid #E0E0E0',
    borderRadius: '10px',
  },

  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#C4CCCF',
  },

  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#EC4A27',
  },

  '&.MuiInputBase-root': {
    fontFamily: 'Inter',
    '@media (min-width: 650px) and (max-width: 2000px)': {
      fontSize: '13px',
    },
    '@media (min-width: 498px) and (max-width: 650px)': { 
      fontSize: '10px',
    },
    '@media screen and (max-width: 499px)': {
      fontSize: '10px'
    }
  },
});

export const CustomLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 5,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: '#909192',
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: '#EC4A27',
  },
}));

export const CustomCircularProgress = ({ value, progressColor, backgroundColor, thickness = 8, size = 60 }) => {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        value={100}
        thickness={thickness}
        size={size}
        sx={{
          color: backgroundColor,
        }}
      />
      <CircularProgress
        variant="determinate"
        value={value}
        thickness={thickness}
        size={size}
        sx={{
          position: 'absolute',
          left: 0,
          color: progressColor,
        }}
      />
    </Box>
  );
};