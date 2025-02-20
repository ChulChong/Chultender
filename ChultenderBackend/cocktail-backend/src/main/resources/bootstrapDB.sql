-- Recipes Table
CREATE TABLE recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,  -- Name of the cocktail
    mainLiqourId INTEGER,  -- Main liquor ID (FK from ingredients)
    glass TEXT,  -- Glass type
    details TEXT,  -- Description of the cocktail
    isActive BOOLEAN DEFAULT TRUE,  -- Availability status (true = available, false = not available)
    FOREIGN KEY (mainLiqourId) REFERENCES ingredients(id)
);

-- Ingredients Table
CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,  -- Ingredient name (unique to avoid duplicates)
    isActive BOOLEAN DEFAULT TRUE,  -- Availability status
    isMainLiqour BOOLEAN DEFAULT FALSE  -- Identifies main liquor (true = main liquor, false = other ingredient)
);

-- Recipe-Ingredients Relationship Table (Many-to-Many)
CREATE TABLE recipe_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER,  -- FK referencing recipes table
    ingredient_id INTEGER,  -- FK referencing ingredients table
    size TEXT,  -- Amount/size of the ingredient
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);


-- Insert Ingredients Data
INSERT INTO ingredients (name, isActive, isMainLiqour) VALUES
('Bourbon', true, true),
('Scotch', true, true),
('Disaronno', true, false),
("Jack Daniel's", true, true),
('Coke', true, false),
('White Rum', true, true),
('Blue Curaçao', true, false),
('Sweet & Sour Mix', true, false),
('Pineapple Juice', true, false),
('Fresh Lime Juice', true, false),
('Mint Sprigs', true, false),
('White Sugar', true, false),
('Soda Water', true, false),
('Piña Colada Mix', true, false),
('Lemon Juice', true, false),
('Simple Syrup', true, false),
('Egg White', true, false),
('Peach Tree', true, false),
('Kahlua', true, false),
('Milk', true, false),
('Grenadine Syrup', true, false),
('Sprite', true, false),
('Triple Sec', true, false),
('Cranberry Juice', true, false),
('Midori', true, false),
('St. Germain', true, false),
('Prosecco', true, false),
('Ginger Ale', true, false),
('Vodka', true, true),
('Espresso', true, false),
('Coffee Beans', true, false),
('Gin', true, true),
('Tonic Water', true, false),
('Red Wine', true, false),
('Strawberry Jam', true, false),
('Angostura Bitter', true, false),
('Orange Peel', true, false),
('Maraschino Cherry', true, false),
('Baileys', true, false),
('Apple Juice', true, false),
('Lime Juice', true, false),
('Sweet & Sour', true, false),
('Malibu', true, false),
('Raspberry Syrup', true, false),
('Champagne', true, false),
('Dry Champagne', true, false),
('Conscription', true, false),
('Club Soda', true, false);

INSERT INTO recipes (name, mainLiqourId, glass, details, isActive) VALUES
('Mint Julep', (SELECT id FROM ingredients WHERE name = 'Bourbon'), 'julep', 'Muddle the mint leaves and simple syrup...', true),
('God Father', (SELECT id FROM ingredients WHERE name = 'Scotch'), 'ontherock', 'Pour all ingredients into old fashioned glass...', true),
('Jack Coke', (SELECT id FROM ingredients WHERE name = 'Jack Daniel''s'), 'highball', '', true),
('Blue Hawaii', (SELECT id FROM ingredients WHERE name = 'White Rum'), 'hurricane', '', true),
('Mojito', (SELECT id FROM ingredients WHERE name = 'White Rum'), 'highball', 'Muddle mint sprigs with sugar and lime juice...', true),
('Espresso Martini', (SELECT id FROM ingredients WHERE name = 'Vodka'), 'coupe', '', true);


INSERT INTO recipe_ingredients (recipe_id, ingredient_id, size) VALUES
-- Mint Julep
((SELECT id FROM recipes WHERE name = 'Mint Julep'), (SELECT id FROM ingredients WHERE name = 'Bourbon'), '2 oz'),
((SELECT id FROM recipes WHERE name = 'Mint Julep'), (SELECT id FROM ingredients WHERE name = 'Mint Leaves'), '8 leaves'),
((SELECT id FROM recipes WHERE name = 'Mint Julep'), (SELECT id FROM ingredients WHERE name = 'Simple Syrup'), '1/2 oz'),

-- God Father
((SELECT id FROM recipes WHERE name = 'God Father'), (SELECT id FROM ingredients WHERE name = 'Scotch'), '2 oz'),
((SELECT id FROM recipes WHERE name = 'God Father'), (SELECT id FROM ingredients WHERE name = 'Disaronno'), '1 3/4 oz'),

-- Jack Coke
((SELECT id FROM recipes WHERE name = 'Jack Coke'), (SELECT id FROM ingredients WHERE name = 'Jack Daniel''s'), '1 1/2 oz'),
((SELECT id FROM recipes WHERE name = 'Jack Coke'), (SELECT id FROM ingredients WHERE name = 'Coke'), 'Fill'),

-- Blue Hawaii
((SELECT id FROM recipes WHERE name = 'Blue Hawaii'), (SELECT id FROM ingredients WHERE name = 'White Rum'), '1 1/2 oz'),
((SELECT id FROM recipes WHERE name = 'Blue Hawaii'), (SELECT id FROM ingredients WHERE name = 'Blue Curaçao'), '1 oz'),
((SELECT id FROM recipes WHERE name = 'Blue Hawaii'), (SELECT id FROM ingredients WHERE name = 'Sweet & Sour Mix'), '1 oz'),
((SELECT id FROM recipes WHERE name = 'Blue Hawaii'), (SELECT id FROM ingredients WHERE name = 'Pineapple Juice'), '4 oz'),

-- Mojito
((SELECT id FROM recipes WHERE name = 'Mojito'), (SELECT id FROM ingredients WHERE name = 'White Rum'), '1 1/3 oz'),
((SELECT id FROM recipes WHERE name = 'Mojito'), (SELECT id FROM ingredients WHERE name = 'Lime Juice'), '1 oz'),
((SELECT id FROM recipes WHERE name = 'Mojito'), (SELECT id FROM ingredients WHERE name = 'Mint Leaves'), '6 sprigs'),
((SELECT id FROM recipes WHERE name = 'Mojito'), (SELECT id FROM ingredients WHERE name = 'Simple Syrup'), '2 tsp'),

-- Espresso Martini
((SELECT id FROM recipes WHERE name = 'Espresso Martini'), (SELECT id FROM ingredients WHERE name = 'Vodka'), '2 oz'),
((SELECT id FROM recipes WHERE name = 'Espresso Martini'), (SELECT id FROM ingredients WHERE name = 'Espresso'), '1 oz'),
((SELECT id FROM recipes WHERE name = 'Espresso Martini'), (SELECT id FROM ingredients WHERE name = 'Kahlua'), '1/2 oz'),
((SELECT id FROM recipes WHERE name = 'Espresso Martini'), (SELECT id FROM ingredients WHERE name = 'Simple Syrup'), '1/2 oz'),
((SELECT id FROM recipes WHERE name = 'Espresso Martini'), (SELECT id FROM ingredients WHERE name = 'Coffee Beans'), '3 whole');