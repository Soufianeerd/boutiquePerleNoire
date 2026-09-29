-- ==============================================================================
-- PERLE NOIRE - SEED DATA
-- Luxury Jewelry Sample Data & Initial Settings
-- ==============================================================================

-- 1. Initial Store Settings (Mode Vitrine par défaut, personnalisable sans code)
INSERT INTO store_settings (
    id,
    brand_name,
    tagline,
    logo_url,
    contact_email,
    phone,
    whatsapp,
    instagram_url,
    address,
    commerce_enabled,
    show_prices,
    allow_guest_checkout,
    default_contact_method,
    currency,
    locale,
    stripe_enabled,
    paypal_enabled,
    low_stock_threshold,
    maintenance_mode
) VALUES (
    1,
    'Perle Noire',
    'Haute Joaillerie & Perles d''Exception',
    NULL,
    'concierge@perlenoire-joaillerie.fr',
    '+33 1 42 68 55 00',
    '+33 6 12 34 56 78',
    'https://instagram.com/perlenoirejoaillerie',
    '18 Place Vendôme, 75001 Paris, France',
    false, -- Mode Vitrine activé par défaut (changeable en 1 clic dans l'admin)
    true,  -- Prix affichés
    true,
    'whatsapp',
    'EUR',
    'fr-FR',
    false,
    false,
    2,
    false
) ON CONFLICT (id) DO NOTHING;

-- 2. Categories
INSERT INTO categories (id, name, slug, description, position, active) VALUES
(
    'c1000000-0000-0000-0000-000000000001',
    'Bagues & Solitaires',
    'bagues',
    'Des créations architecturales sculptées dans l''or 18 carats et sublimées par des gemmes d''exception.',
    1,
    true
),
(
    'c1000000-0000-0000-0000-000000000002',
    'Colliers & Pendentifs',
    'colliers',
    'L''alliance poétique des perles noires de Tahiti et du pavage diamants sur des lignes pures.',
    2,
    true
),
(
    'c1000000-0000-0000-0000-000000000003',
    'Boucles d''Oreilles',
    'boucles-d-oreilles',
    'Des gouttes de lumière et de nacre façonnées pour illuminer le port de tête.',
    3,
    true
),
(
    'c1000000-0000-0000-0000-000000000004',
    'Bracelets & Joncs',
    'bracelets',
    'Le métal précieux courbé avec une précision millimétrique par nos maîtres artisans.',
    4,
    true
),
(
    'c1000000-0000-0000-0000-000000000005',
    'Haute Joaillerie',
    'haute-joaillerie',
    'Pièces uniques numérotées, conçues sur-mesure au sein de notre atelier de la Place Vendôme.',
    5,
    true
)
ON CONFLICT (id) DO NOTHING;

-- 3. Collections
INSERT INTO collections (id, name, slug, description, position, active) VALUES
(
    'b1000000-0000-0000-0000-000000000001',
    'L''Éclat de Tahiti',
    'eclat-de-tahiti',
    'Une célébration de la nacre profonde et des reflets paon des lagons polynésiens.',
    1,
    true
),
(
    'b1000000-0000-0000-0000-000000000002',
    'Nuit Constellée',
    'nuit-constellee',
    'L''or noirci et le diamant blanc scintillant dans un dialogue céleste intemporel.',
    2,
    true
),
(
    'b1000000-0000-0000-0000-000000000003',
    'Lignes Modernistes',
    'lignes-modernistes',
    'Géométrie pure et équilibre sculptural inspirés de l''art déco contemporain.',
    3,
    true
)
ON CONFLICT (id) DO NOTHING;

-- 4. Products
INSERT INTO products (
    id,
    name,
    slug,
    description,
    short_description,
    sku,
    base_price,
    compare_at_price,
    category_id,
    collection_id,
    status,
    featured,
    sell_mode,
    material_details,
    gemstone_details
) VALUES
(
    'p1000000-0000-0000-0000-000000000001',
    'Bague Solitaire Éclipse Noire',
    'solitaire-eclipse-noire',
    'Façonnée à la main en or blanc 18 carats rhodié, cette bague iconique met en majesté une perle de culture de Tahiti de 11,5 mm aux reflets aubergine et vert scarabée, entourée d''un demi-pavage de diamants taille brillant certifiés éthiques.',
    'Or blanc 18 carats, perle de culture de Tahiti 11,5 mm et pavage de diamants taille brillant (0.45 ct).',
    'PN-BAG-001',
    3850.00,
    NULL,
    'c1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'published',
    true,
    'inherit',
    'Or blanc 750/1000 (18K) - 6.2g',
    'Perle de Tahiti AAA 11.5mm & Diamants F-VS 0.45ct'
),
(
    'p1000000-0000-0000-0000-000000000002',
    'Pendentif Horizon Infini',
    'pendentif-horizon-infini',
    'Un trait d''or jaune brossé satiné retenant une perle noire d''un lustre miroir exceptionnel. Une pièce d''épure contemporaine qui traverse les générations sans jamais perdre de son aura mystique.',
    'Pendentif en or jaune 18 carats avec perle de Tahiti 12mm montée sur bélière invisible.',
    'PN-COL-002',
    2400.00,
    NULL,
    'c1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000001',
    'published',
    true,
    'inherit',
    'Or jaune 750/1000 (18K) - 4.8g',
    'Perle de Tahiti ronde AAA 12mm'
),
(
    'p1000000-0000-0000-0000-000000000003',
    'Boucles d''Oreilles Constellation',
    'boucles-constellation',
    'Chaque boucle présente une constellation asymétrique de diamants sertis grain soutenant une goutte de nacre sombre. Leur tombé fluide épouse gracieusement la ligne de la mâchoire.',
    'Paire de boucles d''oreilles pendantes en platine 950 et or blanc avec diamants taille poire et brillant.',
    'PN-BO-003',
    4900.00,
    NULL,
    'c1000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000002',
    'published',
    true,
    'inherit',
    'Or blanc 750/1000 & Platine 950',
    'Diamants F-VVS 0.85ct & Perles Baroques de Tahiti'
),
(
    'p1000000-0000-0000-0000-000000000004',
    'Jonc Sculptural Or Brut & Diamant Noir',
    'jonc-sculptural-or-brut',
    'Un bracelet rigide à charnière invisible, martelé selon les traditions de la ciselure joaillière florentine. La tranche est délicatement sertie d''une ligne de diamants noirs taille brillant.',
    'Bracelet jonc ouvrant en or jaune martelé 18 carats, ligne continue de diamants noirs.',
    'PN-BRC-004',
    6200.00,
    NULL,
    'c1000000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000003',
    'published',
    false,
    'inherit',
    'Or jaune 750/1000 (18K) - 18.5g',
    'Diamants noirs taille brillant 1.20ct'
),
(
    'p1000000-0000-0000-0000-000000000005',
    'Bague Haute Joaillerie Vendôme N°7',
    'bague-haute-joaillerie-vendome-7',
    'Création exclusive de l''Atelier Perle Noire. Pièce maîtresse conçue autour d''une rarissime perle de 15 mm couleur Peacock entourée de pétales d''or blanc sertis de 92 diamants taille navette et brillant. Visible uniquement en salon privé.',
    'Pièce unique de Haute Joaillerie. Présentation sur rendez-vous privé.',
    'PN-HJ-005',
    18500.00,
    NULL,
    'c1000000-0000-0000-0000-000000000005',
    'b1000000-0000-0000-0000-000000000001',
    'unique_piece',
    true,
    'contact_only', -- Toujours sur demande même si le e-commerce est actif!
    'Platine 950/1000 - 14.2g',
    'Perle de Tahiti Rare 15mm & Diamants D-IF 2.45ct'
),
(
    'p1000000-0000-0000-0000-000000000006',
    'Alliance Ligne Pure Diamants Baguette',
    'alliance-ligne-pure-baguette',
    'Le raffinement absolu d''une alliance sertie rail en diamants taille baguette. Une monture basse et ultra confortable conçue pour être portée au quotidien ou combinée à un solitaire.',
    'Alliance en platine 950 avec tour complet de diamants taille baguette.',
    'PN-ALL-006',
    3100.00,
    NULL,
    'c1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000003',
    'published',
    false,
    'inherit',
    'Platine 950/1000 - 4.5g',
    'Diamants baguette F-VS 1.10ct'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Product Images (Neutral elegant placeholders)
INSERT INTO product_images (product_id, url, alt, position, is_primary) VALUES
('p1000000-0000-0000-0000-000000000001', '/images/jewelry/solitaire-eclipse-1.jpg', 'Solitaire Éclipse Noire en or blanc et perle de Tahiti', 1, true),
('p1000000-0000-0000-0000-000000000001', '/images/jewelry/solitaire-eclipse-2.jpg', 'Détail pavage diamants et lustre perle', 2, false),
('p1000000-0000-0000-0000-000000000002', '/images/jewelry/pendentif-horizon-1.jpg', 'Pendentif Horizon Infini or jaune brossé et perle noire', 1, true),
('p1000000-0000-0000-0000-000000000003', '/images/jewelry/boucles-constellation-1.jpg', 'Boucles d''oreilles Constellation platine et diamants', 1, true),
('p1000000-0000-0000-0000-000000000004', '/images/jewelry/jonc-sculptural-1.jpg', 'Jonc or jaune martelé et ligne de diamants noirs', 1, true),
('p1000000-0000-0000-0000-000000000005', '/images/jewelry/haute-joaillerie-vendome-1.jpg', 'Bague Haute Joaillerie Vendôme N°7 pièce unique', 1, true),
('p1000000-0000-0000-0000-000000000006', '/images/jewelry/alliance-ligne-pure-1.jpg', 'Alliance Ligne Pure diamants taille baguette', 1, true)
ON CONFLICT DO NOTHING;

-- 6. Product Variants (Tour de doigt & déclinaisons)
INSERT INTO product_variants (product_id, title, sku, price, size, material, stock_quantity, active) VALUES
('p1000000-0000-0000-0000-000000000001', 'Taille 50 - Or Blanc 18K', 'PN-BAG-001-50', 3850.00, '50', 'Or Blanc 18K', 2, true),
('p1000000-0000-0000-0000-000000000001', 'Taille 52 - Or Blanc 18K', 'PN-BAG-001-52', 3850.00, '52', 'Or Blanc 18K', 3, true),
('p1000000-0000-0000-0000-000000000001', 'Taille 54 - Or Blanc 18K', 'PN-BAG-001-54', 3850.00, '54', 'Or Blanc 18K', 1, true),
('p1000000-0000-0000-0000-000000000002', 'Chaîne 45 cm - Or Jaune 18K', 'PN-COL-002-45', 2400.00, '45cm', 'Or Jaune 18K', 4, true),
('p1000000-0000-0000-0000-000000000003', 'Taille Unique - Or Blanc & Platine', 'PN-BO-003-TU', 4900.00, 'TU', 'Or Blanc & Platine', 2, true),
('p1000000-0000-0000-0000-000000000004', 'Taille M (16-17 cm)', 'PN-BRC-004-M', 6200.00, 'M', 'Or Jaune Martelé', 2, true),
('p1000000-0000-0000-0000-000000000005', 'Pièce Unique Atelier - Taille 53 (Ajustable)', 'PN-HJ-005-U', 18500.00, '53', 'Platine 950', 1, true),
('p1000000-0000-0000-0000-000000000006', 'Taille 52 - Platine 950', 'PN-ALL-006-52', 3100.00, '52', 'Platine 950', 2, true)
ON CONFLICT DO NOTHING;

-- 7. Homepage Sections
INSERT INTO homepage_sections (id, section_type, title, subtitle, position, active, content_json) VALUES
(
    's1000000-0000-0000-0000-000000000001',
    'hero',
    'L''Incomparable Éclat de la Nacre Noire',
    'Haute Joaillerie Contemporaine — Place Vendôme',
    1,
    true,
    jsonb_build_object(
        'eyebrow', 'Maison Fondée à Paris',
        'heading', 'L''Incomparable Éclat de la Nacre Noire',
        'subheading', 'Des joyaux singuliers forgés dans le secret de notre atelier parisien, alliant perles rares de Polynésie et haute tradition joaillière.',
        'primary_cta_label', 'Découvrir la Collection',
        'primary_cta_url', '/bijoux',
        'secondary_cta_label', 'Prendre Rendez-vous',
        'secondary_cta_url', '/contact'
    )
),
(
    's1000000-0000-0000-0000-000000000002',
    'categories',
    'Nos Lignées Joaillières',
    'Découvrez nos créations par univers',
    2,
    true,
    jsonb_build_object(
        'description', 'Chaque pièce reflète une harmonie absolue entre pureté des lignes, rareté géologique et noblesse des métaux.'
    )
),
(
    's1000000-0000-0000-0000-000000000003',
    'featured_products',
    'Créations Emblématiques',
    'Sélection d''œuvres d''art portables',
    3,
    true,
    jsonb_build_object(
        'limit', 4,
        'view_all_url', '/bijoux'
    )
),
(
    's1000000-0000-0000-0000-000000000004',
    'editorial',
    'Le Savoir-Faire de la Place Vendôme',
    'L''Excellence d''un Atelier Dédié',
    4,
    true,
    jsonb_build_object(
        'quote', 'Une perle noire n''est jamais tout à fait noire. Elle recèle des reflets d''émeraude, d''aubergine et d''aurore boréale que seul l''or le plus pur peut révéler.',
        'author', 'Atelier Perle Noire',
        'location', '18 Place Vendôme, Paris',
        'cta_label', 'Notre Histoire & Philosophie',
        'cta_url', '/a-propos'
    )
),
(
    's1000000-0000-0000-0000-000000000005',
    'reassurance',
    'La Promesse d''une Grande Maison',
    'Garanties & Privilèges',
    5,
    true,
    jsonb_build_object(
        'items', jsonb_build_array(
            jsonb_build_object('title', 'Certificat d''Authenticité', 'desc', 'Chaque perle et diamant fait l''objet d''une expertise rigoureuse et d''un certificat officiel.'),
            jsonb_build_object('title', 'Atelier sur Rendez-vous', 'desc', 'Présentation privée dans nos salons de la Place Vendôme ou consultation vidéo dédiée.'),
            jsonb_build_object('title', 'Livraison Sécurisée & Assurée', 'desc', 'Transport en valeur déclarée sécurisé par convoyeur spécialisé dans le monde entier.'),
            jsonb_build_object('title', 'Mise à Taille Offerte', 'desc', 'Ajustement parfait réalisé gracieusement par nos orfèvres pour toute création.')
        )
    )
)
ON CONFLICT (id) DO NOTHING;
