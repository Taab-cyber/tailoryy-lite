"""One-time script to seed the Neon production database."""
import os

# Override DATABASE_URL before any app imports
os.environ["DATABASE_URL"] = "postgresql://neondb_owner:npg_xC6DIcS8hRLi@ep-sparkling-queen-amw6yytc.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
os.environ["SECRET_KEY"] = "50da2dc19a62516a8ebfdb0c9bc016ee5285122512340fcd33d573942b2735c0"
os.environ["ENVIRONMENT"] = "production"
os.environ["RESEND_API_KEY"] = "re_35uPAZ64_33XDcDB8i7UuiLV5tZWkbPfu"
os.environ["ADMIN_EMAIL"] = "mehtaabkohli@gmail.com"
os.environ["FROM_EMAIL"] = "onboarding@resend.dev"
os.environ["FIREBASE_PROJECT_ID"] = "placeholder"
os.environ["FIREBASE_PRIVATE_KEY"] = "placeholder"
os.environ["FIREBASE_CLIENT_EMAIL"] = "placeholder"
os.environ["CLOUDINARY_CLOUD_NAME"] = "placeholder"
os.environ["CLOUDINARY_API_KEY"] = "placeholder"
os.environ["CLOUDINARY_API_SECRET"] = "placeholder"
os.environ["RAZORPAY_KEY_ID"] = "placeholder"
os.environ["RAZORPAY_KEY_SECRET"] = "placeholder"
os.environ["FRONTEND_URL"] = "https://tailoryy-lite.vercel.app"

# Now run the actual seed logic
exec(open("app/seed.py").read())
