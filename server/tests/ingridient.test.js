const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const ingredientRouter = require('../ingredient/ingredient');
const ingredientRemoveRouter = require('../ingredient/ingredientRemove');
const ingredientUpdateRouter = require('../ingredient/ingredientUpdate');
const userIngredientRouter = require('../ingredient/user_ingredient');

// Mock dependencies
jest.mock('../db', () => ({
    query: jest.fn()
}));
jest.mock('jsonwebtoken');

// Suppress console logs during tests
global.console.error = jest.fn();

// Create Express app and configure routes
const app = express();
app.use(express.json());
app.use('/ingredient', ingredientRouter);
app.use('/ingredient/remove', ingredientRemoveRouter);
app.use('/ingredient/update', ingredientUpdateRouter);
app.use('/ingredient/user', userIngredientRouter);


app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

describe('Ingredient Router', () => {
    const validToken = 'validToken';
    const userId = 1;
    const mockIngredient = {
        ingredient_name: 'tomato',
        amount: 5,
        unit: 'pieces',
        possibleUnits: ['pieces', 'grams']
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default JWT verification
        jwt.verify = jest.fn((token, secret, callback) => {
            if (token === validToken) {
                callback(null, { id: userId });
            } else {
                callback(new Error('Invalid token'));
            }
        });
    });

    describe('POST /ingredient', () => {
        test('should add new ingredient successfully', async () => {
            // Mock ingredient doesn't exist
            pool.query
                .mockResolvedValueOnce({ rows: [] }) // Check if ingredient exists
                .mockResolvedValueOnce({ rows: [{ ingredient_id: 1 }] }) // Insert new ingredient
                .mockResolvedValueOnce({ rows: [] }) // Check user_ingredient
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Insert user_ingredient

            const response = await request(app)
                .post('/ingredient')
                .set('Authorization', `Bearer ${validToken}`)
                .send(mockIngredient);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Ingredient added successfully!');
            expect(pool.query).toHaveBeenCalledTimes(4);
        });

        test('should update existing ingredient successfully', async () => {
            // Mock ingredient exists
            pool.query
                .mockResolvedValueOnce({ rows: [{ ingredient_id: 1 }] }) // Check if ingredient exists
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Check user_ingredient
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Update user_ingredient

            const response = await request(app)
                .post('/ingredient')
                .set('Authorization', `Bearer ${validToken}`)
                .send(mockIngredient);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Ingredient updated successfully!');
        });

        test('should delete ingredient when amount is 0', async () => {
            // Mock ingredient exists
            pool.query
                .mockResolvedValueOnce({ rows: [{ ingredient_id: 1 }] }) // Check if ingredient exists
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Check user_ingredient
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Delete user_ingredient

            const response = await request(app)
                .post('/ingredient')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ ...mockIngredient, amount: 0 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Ingredient deleted successfully!');
        });

        test('should handle attempt to add ingredient with 0 amount', async () => {
            // Mock ingredient doesn't exist
            pool.query
                .mockResolvedValueOnce({ rows: [] }) // Check if ingredient exists
                .mockResolvedValueOnce({ rows: [{ ingredient_id: 1 }] }) // Insert new ingredient
                .mockResolvedValueOnce({ rows: [] }); // Check user_ingredient

            const response = await request(app)
                .post('/ingredient')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ ...mockIngredient, amount: 0 });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Cannot add ingredient with amount 0!');
        });

        test('should handle database errors', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/ingredient')
                .set('Authorization', `Bearer ${validToken}`)
                .send(mockIngredient);

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Internal server error');
        });
    });

    describe('POST /ingredient/use-recipe', () => {
        const mockRecipe = {
            extendedIngredients: [
                { id: 1, amount: 2, original: 'tomato' },
                { id: 2, amount: 1, original: 'onion' }
            ]
        };

        test('should use recipe successfully when all ingredients are available', async () => {
            // Mock ingredient checks
            pool.query
                .mockResolvedValueOnce({ rows: [{ amount: 5 }] }) // First ingredient check
                .mockResolvedValueOnce({ rows: [{ amount: 3 }] }) // Second ingredient check
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // First ingredient update
                .mockResolvedValueOnce({ rows: [{ id: 2 }] }); // Second ingredient update

            const response = await request(app)
                .post('/ingredient/use-recipe')
                .send({ userId: userId, recipe: mockRecipe });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Recipe used successfully!');
        });

        test('should handle missing ingredients', async () => {
            // Mock insufficient ingredients
            pool.query
                .mockResolvedValueOnce({ rows: [{ amount: 1 }] }) // First ingredient insufficient
                .mockResolvedValueOnce({ rows: [] }); // Second ingredient missing

            const response = await request(app)
                .post('/ingredient/use-recipe')
                .send({ userId: userId, recipe: mockRecipe });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Missing ingredients');
            expect(response.body.missingIngredients).toBeDefined();
            expect(response.body.missingIngredients.length).toBeGreaterThan(0);
        });

        test('should handle missing request data', async () => {
            const response = await request(app)
                .post('/ingredient/use-recipe')
                .send({ userId: userId }); // Missing recipe data

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Missing userId or recipe data');
        });

        test('should handle database errors in recipe use', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/ingredient/use-recipe')
                .send({ userId: userId, recipe: mockRecipe });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Internal server error');
        });
    });

    describe('Authentication', () => {
        test('should require authentication token for ingredient operations', async () => {
            const response = await request(app)
                .post('/ingredient')
                .send(mockIngredient);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Token not found');
        });

        test('should reject invalid token', async () => {
            const response = await request(app)
                .post('/ingredient')
                .set('Authorization', 'Bearer invalidToken')
                .send(mockIngredient);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Invalid token');
        });

        test('should reject token with invalid payload', async () => {
            jwt.verify = jest.fn((token, secret, callback) => {
                callback(null, {}); // Missing id in payload
            });

            const response = await request(app)
                .post('/ingredient')
                .set('Authorization', `Bearer ${validToken}`)
                .send(mockIngredient);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Invalid token payload');
        });
    });

    describe('Ingredient Remove Operations', () => {
        const validToken = 'validToken';
        const userId = 1;
        const ingredientId = 123;

        beforeEach(() => {
            jest.clearAllMocks();
            jwt.verify = jest.fn((token, secret, callback) => {
                if (token === validToken) {
                    callback(null, { id: userId });
                } else {
                    callback(new Error('Invalid token'));
                }
            });
        });

        test('should delete ingredient successfully', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .delete('/ingredient/remove')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ ingredientId });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Ingredient deleted successfully!');
            expect(pool.query).toHaveBeenCalledWith(
                'DELETE FROM user_ingredient WHERE user_id = $1 AND ingredient_id = $2',
                [userId, ingredientId]
            );
        });

        test('should handle database error during deletion', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .delete('/ingredient/remove')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ ingredientId });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Internal server error');
        });

        test('should require authentication for deletion', async () => {
            const response = await request(app)
                .delete('/ingredient/remove')
                .send({ ingredientId });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Token not found');
        });
    });

    describe('Ingredient Update Operations', () => {
        const validToken = 'validToken';
        const userId = 1;
        const mockUpdateData = {
            ingredientId: 123,
            amount: 5,
            unit: 'cups'
        };

        beforeEach(() => {
            jest.clearAllMocks();
            jwt.verify = jest.fn((token, secret, callback) => {
                if (token === validToken) {
                    callback(null, { id: userId });
                } else {
                    callback(new Error('Invalid token'));
                }
            });
        });

        test('should update ingredient successfully', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .post('/ingredient/update')
                .set('Authorization', `Bearer ${validToken}`)
                .send(mockUpdateData);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Ingredient updated successfully!');
            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE user_ingredient SET amount = $1, unit = $2 WHERE user_id = $3 AND ingredient_id = $4',
                [mockUpdateData.amount, mockUpdateData.unit, userId, mockUpdateData.ingredientId]
            );
        });

        test('should handle database error during update', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/ingredient/update')
                .set('Authorization', `Bearer ${validToken}`)
                .send(mockUpdateData);

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Internal server error');
        });

        test('should require authentication for update', async () => {
            const response = await request(app)
                .post('/ingredient/update')
                .send(mockUpdateData);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Token not found');
        });

        test('should reject invalid token for update', async () => {
            const response = await request(app)
                .post('/ingredient/update')
                .set('Authorization', 'Bearer invalidToken')
                .send(mockUpdateData);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Invalid token');
        });

        test('should reject token with missing user id', async () => {
            jwt.verify = jest.fn((token, secret, callback) => {
                callback(null, {}); // Token payload without id
            });

            const response = await request(app)
                .post('/ingredient/update')
                .set('Authorization', `Bearer ${validToken}`)
                .send(mockUpdateData);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Invalid token payload');
        });
    });

    describe('User Ingredient Operations', () => {
        const validToken = 'validToken';
        const userId = 1;
        
        beforeEach(() => {
            jest.clearAllMocks();
            jwt.verify = jest.fn((token, secret, callback) => {
                if (token === validToken) {
                    callback(null, { id: userId });
                } else {
                    callback(new Error('Invalid token'));
                }
            });
        });
    
        describe('POST / (Get User Ingredients)', () => {
            test('should return empty array when user has no ingredients', async () => {
                pool.query.mockResolvedValueOnce({ rows: [] });
    
                const response = await request(app)
                    .post('/ingredient/user')
                    .set('Authorization', `Bearer ${validToken}`);
    
                expect(response.status).toBe(200);
                expect(response.body).toEqual([]);
            });
    
            test('should return user ingredients successfully', async () => {
                // Mock user ingredients query
                pool.query
                    .mockResolvedValueOnce({
                        rows: [
                            { ingredient_id: 1, amount: 5, unit: 'cups', possible_units: ['cups', 'ml'] },
                            { ingredient_id: 2, amount: 2, unit: 'pieces', possible_units: ['pieces', 'grams'] }
                        ]
                    })
                    // Mock ingredient names query
                    .mockResolvedValueOnce({
                        rows: [
                            { ingredient_id: 1, name: 'flour' },
                            { ingredient_id: 2, name: 'tomato' }
                        ]
                    });
    
                const response = await request(app)
                    .post('/ingredient/user')
                    .set('Authorization', `Bearer ${validToken}`);
    
                expect(response.status).toBe(200);
                expect(response.body).toHaveLength(2);
                expect(response.body[0]).toEqual({
                    name: 'flour',
                    amount: 5,
                    unit: 'cups',
                    ingredient_id: 1,
                    possible_units: ['cups', 'ml']
                });
            });
    
            test('should handle missing ingredient names gracefully', async () => {
                pool.query
                    .mockResolvedValueOnce({
                        rows: [
                            { ingredient_id: 1, amount: 5, unit: 'cups', possible_units: ['cups', 'ml'] }
                        ]
                    })
                    .mockResolvedValueOnce({
                        rows: [] // No matching ingredient names found
                    });
    
                const response = await request(app)
                    .post('/ingredient/user')
                    .set('Authorization', `Bearer ${validToken}`);
    
                expect(response.status).toBe(200);
                expect(response.body[0].name).toBe('Unknown ingredient');
            });
    
            test('should handle database errors', async () => {
                pool.query.mockRejectedValueOnce(new Error('Database error'));
    
                const response = await request(app)
                    .post('/ingredient/user')
                    .set('Authorization', `Bearer ${validToken}`);
    
                expect(response.status).toBe(500);
                expect(response.body.message).toBe('Error fetching ingredients');
            });
    
            test('should require authentication', async () => {
                const response = await request(app)
                    .post('/ingredient/user');
    
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('Token not found');
            });
    
            test('should reject invalid token', async () => {
                const response = await request(app)
                    .post('/ingredient/user')
                    .set('Authorization', 'Bearer invalidToken');
    
                expect(response.status).toBe(403);
                expect(response.body.message).toBe('Invalid token');
            });
    
            test('should reject token with missing user id', async () => {
                jwt.verify = jest.fn((token, secret, callback) => {
                    callback(null, {}); // Token payload without id
                });
    
                const response = await request(app)
                    .post('/ingredient/user')
                    .set('Authorization', `Bearer ${validToken}`);
    
                expect(response.status).toBe(403);
                expect(response.body.message).toBe('Invalid token payload');
            });
        });
    });
});