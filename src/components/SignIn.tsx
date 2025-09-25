import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from '@/lib/auth-client'
import { motion } from 'motion/react'

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
      <div className="w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative flex items-center justify-center p-8">
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-600/15 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white mb-8"
          >
            <h2 className="text-2xl font-medium mb-4">Why choose Appraise?</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Join thousands of mortgage professionals who have streamlined their appraisal ordering process.
            </p>
          </motion.div>
          
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div 
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Streamlined Workflow</h3>
                <p className="text-slate-300 text-sm">Reduce appraisal ordering time by 70% with our automated processes</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L10.5 6.5L16 8L10.5 9.5L8 15L5.5 9.5L0 8L5.5 6.5L8 1Z" fill="white"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Premium Features</h3>
                <p className="text-slate-300 text-sm">Access bulk ordering, property enrichment, and advanced analytics</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 1.0 }}
            >
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14Z" fill="white"/>
                  <path d="M8 4C5.79 4 4 5.79 4 8C4 10.21 5.79 12 8 12C10.21 12 12 10.21 12 8C12 5.79 10.21 4 8 4Z" fill="white"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Trusted Network</h3>
                <p className="text-slate-300 text-sm">Connect with vetted, certified appraisers across all major markets</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
