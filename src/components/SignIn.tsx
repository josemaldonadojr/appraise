import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from '@/lib/auth-client'

const handleGoogleSignIn = async () => {
  await authClient.signIn.social(
    {
      provider: 'google',
    },
  )
}

export function SignIn() {
  return (
    <div className="min-h-screen bg-[#ffffff] flex">
      <div className="w-1/2 flex flex-col justify-center items-center px-12 py-8">
        <div className="flex flex-col items-center gap-8 max-w-[464px]">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center">
              <span className="text-[#202020] text-xl font-medium">appraise.</span>
            </div>
            <h1 className="text-[#202020] text-[32px] font-medium leading-[35px] text-center tracking-[-0.026px] w-[464px]">
              Build real relationships
              <br />
              to close winning deals
            </h1>
          </div>
          <div className="flex flex-col items-center gap-4 w-[288px]">
            <Button onClick={handleGoogleSignIn} className="w-full h-[31px] bg-[#202020] hover:bg-[#202020]/90 text-[#fcfcfc] rounded-full px-[65px] py-[6px] flex items-center justify-center gap-[6px] text-[13px] font-medium leading-[19px] tracking-[-0.026px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          <p className="text-[#646464] text-[13px] font-normal leading-[18px] text-center tracking-[-0.026px] w-[288px]">
            By signing up you agree to the appraise Privacy Policy and Terms of Use
          </p>
        </div>
      </div>
      <div className="w-1/2 bg-[#ebebeb] relative">
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-8 w-[720px] h-8 px-[237px]">
        </div>
      </div>
    </div>
  )
}
