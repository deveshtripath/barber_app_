-- Function to update barber ratings when a new review is added
CREATE OR REPLACE FUNCTION update_barber_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.barbers
    SET rating = (
        SELECT AVG(rating)
        FROM public.reviews
        WHERE barber_id = NEW.barber_id
    )
    WHERE id = NEW.barber_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update barber rating when a review is added or updated
DROP TRIGGER IF EXISTS update_barber_rating_trigger ON public.reviews;
CREATE TRIGGER update_barber_rating_trigger
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_barber_rating();

-- Function to create a notification when an appointment status changes
CREATE OR REPLACE FUNCTION create_appointment_notification()
RETURNS TRIGGER AS $$
DECLARE
    notification_message TEXT;
BEGIN
    IF OLD.status IS NULL OR NEW.status != OLD.status THEN
        CASE NEW.status
            WHEN 'confirmed' THEN
                notification_message := 'Your appointment has been confirmed.';
            WHEN 'completed' THEN
                notification_message := 'Your appointment has been marked as completed.';
            WHEN 'cancelled' THEN
                notification_message := 'Your appointment has been cancelled.';
            ELSE
                notification_message := 'Your appointment status has been updated to ' || NEW.status || '.';
        END CASE;
        
        -- Create notification for customer
        INSERT INTO public.notifications (user_id, message, type)
        VALUES (NEW.customer_id, notification_message, 'appointment');
        
        -- Create notification for barber
        IF NEW.status = 'pending' THEN
            INSERT INTO public.notifications (user_id, message, type)
            VALUES (
                NEW.barber_id, 
                'New appointment request received for ' || NEW.appointment_time || '.', 
                'appointment'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notifications when appointment status changes
DROP TRIGGER IF EXISTS appointment_notification_trigger ON public.appointments;
CREATE TRIGGER appointment_notification_trigger
AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION create_appointment_notification();

-- Function to update barber earnings when a payment is successful
CREATE OR REPLACE FUNCTION update_barber_earnings()
RETURNS TRIGGER AS $$
DECLARE
    barber_id UUID;
BEGIN
    IF NEW.transaction_status = 'success' THEN
        -- Get the barber_id from the appointment
        SELECT appointments.barber_id INTO barber_id
        FROM public.appointments
        WHERE appointments.id = NEW.appointment_id;
        
        -- Update barber earnings
        IF barber_id IS NOT NULL THEN
            UPDATE public.barbers
            SET earnings = earnings + NEW.amount
            WHERE id = barber_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update barber earnings when a payment is successful
DROP TRIGGER IF EXISTS update_barber_earnings_trigger ON public.payments;
CREATE TRIGGER update_barber_earnings_trigger
AFTER INSERT OR UPDATE OF transaction_status ON public.payments
FOR EACH ROW
EXECUTE FUNCTION update_barber_earnings();

-- Function to update appointment payment status when a payment is made
CREATE OR REPLACE FUNCTION update_appointment_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_status = 'success' THEN
        UPDATE public.appointments
        SET payment_status = 'paid'
        WHERE id = NEW.appointment_id;
    ELSIF NEW.transaction_status = 'failed' THEN
        UPDATE public.appointments
        SET payment_status = 'failed'
        WHERE id = NEW.appointment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update appointment payment status when a payment is made
DROP TRIGGER IF EXISTS update_appointment_payment_status_trigger ON public.payments;
CREATE TRIGGER update_appointment_payment_status_trigger
AFTER INSERT OR UPDATE OF transaction_status ON public.payments
FOR EACH ROW
EXECUTE FUNCTION update_appointment_payment_status();

-- Function to add loyalty points when an appointment is completed
CREATE OR REPLACE FUNCTION add_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
    points_to_add INTEGER := 10; -- Default points per appointment
    existing_record_id UUID;
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Check if customer already has a loyalty record
        SELECT id INTO existing_record_id
        FROM public.loyalty_rewards
        WHERE customer_id = NEW.customer_id;
        
        IF existing_record_id IS NOT NULL THEN
            -- Update existing record
            UPDATE public.loyalty_rewards
            SET points = points + points_to_add,
                last_updated = NOW()
            WHERE id = existing_record_id;
        ELSE
            -- Create new record
            INSERT INTO public.loyalty_rewards (customer_id, points)
            VALUES (NEW.customer_id, points_to_add);
        END IF;
        
        -- Create notification for customer about earned points
        INSERT INTO public.notifications (user_id, message, type)
        VALUES (
            NEW.customer_id, 
            'You earned ' || points_to_add || ' loyalty points for your completed appointment!', 
            'promo'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add loyalty points when an appointment is completed
DROP TRIGGER IF EXISTS add_loyalty_points_trigger ON public.appointments;
CREATE TRIGGER add_loyalty_points_trigger
AFTER UPDATE OF status ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION add_loyalty_points();
