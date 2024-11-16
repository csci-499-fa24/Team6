"use client";

import RecipeDetails from '@/app/components/recipeDetail';

const RecipeDetail = ({params}) => {
    return <RecipeDetails params={params.id}/>;
};

export default RecipeDetail;
