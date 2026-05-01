<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/class.phpmailer.php';
require_once __DIR__ . '/class.smtp.php';
require_once __DIR__ . '/smtp_config.php';

/*
|--------------------------------------------------------------------------
| Send Admin Payment Notification
|--------------------------------------------------------------------------
*/
function sendAdminPaymentMail($userName, $userEmail, $amount)
{
    try {
        $mail = new PHPMailer(true);

        // SMTP Setup
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = '';
        $mail->Port = SMTP_PORT;

        // SSL Fix
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );

        // Sender & Admin Receiver
        $mail->setFrom(SMTP_USER, SMTP_FROM_NAME);
        $mail->addAddress(ADMIN_EMAIL); // <-- smtp_config me define karo
        $mail->addReplyTo($userEmail, $userName);

        // Email Content
        $mail->isHTML(true);
        $mail->Subject = "New Payment Received - " . SMTP_FROM_NAME;
        $mail->Body = getAdminTemplate($userName, $userEmail, $amount);

        $mail->send();
        return true;

    } catch (Exception $e) {
        error_log("Admin Mail Error: " . $mail->ErrorInfo);
        return $mail->ErrorInfo;
    }
}

/*
|--------------------------------------------------------------------------
| Admin Email Template (Same UI Style)
|--------------------------------------------------------------------------
*/
function getAdminTemplate($name, $email, $amount)
{
    return '
    <div style="font-family: \'Nunito\', \'Inter\', \'Segoe UI\', Roboto, sans-serif; background-color: #ffffff; padding: 50px 20px; margin: 0; color: #334155;">
        <div style="max-width: 550px; margin: 0 auto; text-align: center;">
            
            <!-- Header -->
            <div style="padding-bottom: 30px;">
                <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #0f172a;">' . SMTP_FROM_NAME . '</h1>
                <p style="margin: 5px 0 0; color: #10b981; font-weight: 700; font-size: 13px; letter-spacing: 3px;">ADMIN ALERT</p>
            </div>

            <!-- Content -->
            <div style="padding: 0 15px; text-align: left;">
                <p style="font-size: 16px; color: #475569;">
                    A new payment has been successfully received.
                </p>

                <div style="background: #f8fafc; border: 2px dashed #10b981; border-radius: 20px; padding: 30px; margin: 30px 0;">
                    
                    <p><strong>User Name:</strong> ' . htmlspecialchars($name) . '</p>
                    <p><strong>Email:</strong> ' . htmlspecialchars($email) . '</p>
                    <p><strong>Amount:</strong> ₹' . htmlspecialchars($amount) . '</p>

                </div>

                <p style="font-size: 13px; color: #94a3b8;">
                    This is an automated notification for admin tracking.
                </p>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #f1f5f9; padding-top: 30px; margin-top: 40px;">
                <p style="font-size: 12px; color: #94a3b8;">
                    © ' . date('Y') . ' ' . SMTP_FROM_NAME . ' - Secure System
                </p>
            </div>

        </div>
    </div>';
}

/*
|--------------------------------------------------------------------------
| API Handler
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $amount = $_POST['amount'] ?? '';

    if (!$name || !$email || !$amount) {
        echo json_encode([
            "success" => false,
            "message" => "Missing fields"
        ]);
        exit;
    }

    $result = sendAdminPaymentMail($name, $email, $amount);

    if ($result === true) {
        echo json_encode([
            "success" => true,
            "message" => "Admin notified"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => $result
        ]);
    }
}
?>