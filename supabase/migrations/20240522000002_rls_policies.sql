-- Users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
    ON public.users FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Barbers table policies
DROP POLICY IF EXISTS "Barbers can view and update their own data" ON public.barbers;
CREATE POLICY "Barbers can view and update their own data"
    ON public.barbers FOR ALL
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Customers can view barber profiles" ON public.barbers;
CREATE POLICY "Customers can view barber profiles"
    ON public.barbers FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage all barbers" ON public.barbers;
CREATE POLICY "Admins can manage all barbers"
    ON public.barbers FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Appointments table policies
DROP POLICY IF EXISTS "Customers can view their own appointments" ON public.appointments;
CREATE POLICY "Customers can view their own appointments"
    ON public.appointments FOR SELECT
    USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can create appointments" ON public.appointments;
CREATE POLICY "Customers can create appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can update their own appointments" ON public.appointments;
CREATE POLICY "Customers can update their own appointments"
    ON public.appointments FOR UPDATE
    USING (auth.uid() = customer_id AND status NOT IN ('completed', 'cancelled'));

DROP POLICY IF EXISTS "Barbers can view their appointments" ON public.appointments;
CREATE POLICY "Barbers can view their appointments"
    ON public.appointments FOR SELECT
    USING (auth.uid() = barber_id);

DROP POLICY IF EXISTS "Barbers can update their appointments" ON public.appointments;
CREATE POLICY "Barbers can update their appointments"
    ON public.appointments FOR UPDATE
    USING (auth.uid() = barber_id);

DROP POLICY IF EXISTS "Admins can manage all appointments" ON public.appointments;
CREATE POLICY "Admins can manage all appointments"
    ON public.appointments FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Payments table policies
DROP POLICY IF EXISTS "Customers can view their own payments" ON public.payments;
CREATE POLICY "Customers can view their own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Barbers can view payments for their appointments" ON public.payments;
CREATE POLICY "Barbers can view payments for their appointments"
    ON public.payments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.appointments
        WHERE appointments.id = appointment_id AND appointments.barber_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
CREATE POLICY "Admins can manage all payments"
    ON public.payments FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Notifications table policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
CREATE POLICY "Admins can manage all notifications"
    ON public.notifications FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Reviews table policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews"
    ON public.reviews FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Customers can create reviews" ON public.reviews;
CREATE POLICY "Customers can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can update their own reviews" ON public.reviews;
CREATE POLICY "Customers can update their own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
CREATE POLICY "Admins can manage all reviews"
    ON public.reviews FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Admin Controls table policies
DROP POLICY IF EXISTS "Only admins can access admin controls" ON public.admin_controls;
CREATE POLICY "Only admins can access admin controls"
    ON public.admin_controls FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Loyalty Rewards table policies
DROP POLICY IF EXISTS "Customers can view their own loyalty rewards" ON public.loyalty_rewards;
CREATE POLICY "Customers can view their own loyalty rewards"
    ON public.loyalty_rewards FOR SELECT
    USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Admins can manage all loyalty rewards" ON public.loyalty_rewards;
CREATE POLICY "Admins can manage all loyalty rewards"
    ON public.loyalty_rewards FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    ));
