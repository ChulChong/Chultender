-- Create Recipes Table
CREATE TABLE recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, -- Name of the cocktail
    mainLiqourId INTEGER FOREIGN KEY REFERENCES ingredients(id),
    ingredientsId INTEGER FOREIGN KEY REFERENCES ingredients(id),  
    image TEXT, -- Image of the cocktail    
    size TEXT,  -- Size of the ingredients
    glass TEXT, -- Glass Type   
    details TEXT,   -- Description of the cocktail
    isActive BOOLEAN DEFAULT TRUE,  -- 1 = Available, 0 = Not Available
);

-- Create Ingredients Table
CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, -- Name of the ingredient
    isActive BOOLEAN DEFAULT TRUE,  -- 1 = Available, 0 = Not Available
    isMainLiqour BOOLEAN DEFAULT FALSE,  -- 1 = Main Liquor, 0 = Not Main Liquor
);

INSERT INTO recipes (name, main_liquor, details, image) VALUES
('Mint Julep', 'Bourbon', 'A refreshing cocktail...', 'MintJulep.png');

INSERT INTO ingredients (recipe_id, name, IsActive) VALUES
(1, 'Bourbon', TRUE),
(1, 'Mint Leaves', TRUE),
(1, 'Simple Syrup', TRUE);

INSERT INTO ingredients (recipe_id, name) VALUES
('mintjulep', 'Bourbon'),
('mintjulep', 'Mint Leaves'),
('mintjulep', 'Mint Sprig'),
('mintjulep', 'Simple Syrup'),
('godfather', 'Scotch'),
('godfather', 'Disaronno'),
('jackcoke', 'Jack Daniel''s'),
('jackcoke', 'Coke'),
('bluehawaii', 'White Rum'),
('bluehawaii', 'Blue Curaçao'),
('bluehawaii', 'Sweet & sour Mix'),
('bluehawaii', 'Pineapple Juice'),
('mojito', 'White Rum'),
('mojito', 'Fresh Lime Juice'),
('mojito', 'Mint Sprigs'),
('mojito', 'White Sugar'),
('mojito', 'Soda Water'),
('pinacolada', 'White Rum'),
('pinacolada', 'Pineapple Juice'),
('pinacolada', 'Piña colada mix'),
('whiskeysour', 'Bourbon'),
('whiskeysour', 'Lemon Juice'),
('whiskeysour', 'Simple Syrup'),
('whiskeysour', 'Egg White');