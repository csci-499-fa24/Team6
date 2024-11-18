'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/navbar';
import styles from './RecipeDetailPage.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { CustomCircularProgress } from '../../components/customComponents';
import LoadingScreen from '@/app/components/loading';
import ErrorScreen from '@/app/components/error';
import RecipeDetails from '@/app/components/recipeDetail';

const RecipeDetailPlan = () => {
    return <RecipeDetails/>;
};

export default RecipeDetailPlan;
