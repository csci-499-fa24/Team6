"use client";

import RecipeDetails from '@/app/components/recipeDetail';

const RecipeDetail = ({params}) => {
    console.log(params.id)
    return <RecipeDetails params={params.id}/>;
};

export default RecipeDetail;