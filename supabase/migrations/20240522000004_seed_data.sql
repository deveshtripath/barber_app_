-- Seed admin user
INSERT INTO public.users (id, role, name, email, phone, profile_image)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'Admin User',
    'admin@cutqueue.com',
    '+1234567890',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
)
ON CONFLICT (id) DO NOTHING;

-- Seed barber users
INSERT INTO public.users (id, role, name, email, phone, profile_image)
VALUES 
    ('00000000-0000-0000-0000-000000000002', 'barber', 'James Wilson', 'james@cutqueue.com', '+1234567891', 'https://api.dicebear.com/7.x/avataaars/svg?seed=james'),
    ('00000000-0000-0000-0000-000000000003', 'barber', 'Maria Garcia', 'maria@cutqueue.com', '+1234567892', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria'),
    ('00000000-0000-0000-0000-000000000004', 'barber', 'David Chen', 'david@cutqueue.com', '+1234567893', 'https://api.dicebear.com/7.x/avataaars/svg?seed=david')
ON CONFLICT (id) DO NOTHING;

-- Seed customer users
INSERT INTO public.users (id, role, name, email, phone, profile_image)
VALUES 
    ('00000000-0000-0000-0000-000000000005', 'customer', 'John Doe', 'john@example.com', '+1234567894', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'),
    ('00000000-0000-0000-0000-000000000006', 'customer', 'Jane Smith', 'jane@example.com', '+1234567895', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane'),
    ('00000000-0000-0000-0000-000000000007', 'customer', 'Bob Johnson', 'bob@example.com', '+1234567896', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob')
ON CONFLICT (id) DO NOTHING;

-- Seed barber details
INSERT INTO public.barbers (id, shop_name, services_offered, experience, availability_status, rating)
VALUES 
    (
        '00000000-0000-0000-0000-000000000002', 
        'Main Street Shop', 
        '{"services": ["Classic Haircut", "Beard Trim", "Hot Towel Shave"]}', 
        5, 
        true, 
        4.8
    ),
    (
        '00000000-0000-0000-0000-000000000003', 
        'Downtown Location', 
        '{"services": ["Fade Haircut", "Hair Coloring", "Styling"]}', 
        8, 
        true, 
        4.9
    ),
    (
        '00000000-0000-0000-0000-000000000004', 
        'Eastside Barbers', 
        '{"services": ["Beard Styling", "Premium Haircut", "Kids Haircut"]}', 
        3, 
        true, 
        4.7
    )
ON CONFLICT (id) DO NOTHING;

-- Seed admin controls
INSERT INTO public.admin_controls (admin_id, settings, reports)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '{"commission_rate": 10, "platform_fee": 5, "notification_settings": {"email": true, "push": true}}',
    '{"monthly_revenue": {}, "user_growth": {}, "appointment_analytics": {}}'
)
ON CONFLICT (admin_id) DO NOTHING;

-- Seed loyalty rewards for customers
INSERT INTO public.loyalty_rewards (customer_id, points)
VALUES 
    ('00000000-0000-0000-0000-000000000005', 150),
    ('00000000-0000-0000-0000-000000000006', 75),
    ('00000000-0000-0000-0000-000000000007', 200)
ON CONFLICT (customer_id) DO NOTHING;
