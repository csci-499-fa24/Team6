import { styled, TextField, Select, LinearProgress, linearProgressClasses, CircularProgress } from '@mui/material';
import { Box } from '@mui/material';

export const CustomTextField = styled(TextField)({
  '& label': {
    color: '#8C8A8A',
    fontFamily: "Inter",
  },
  '& label.Mui-focused': {
    color: '#EC4A27',
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'White',
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
      backgroundColor: 'White',
      borderRadius: '10px',
    },
  },
});

export const CustomDropdown = styled(Select)({
  backgroundColor: 'white',
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