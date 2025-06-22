
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { LoaderCircle, Eye, EyeClosed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export const SignupForm = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupFormData>();
  const { signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const password = watch('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: SignupFormData) => {
    const { error } = await signUp(data.email, data.password);
    
    if (error) {
      toast({
        title: "Sign up failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created",
        description: "Check your email to verify your account.",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Sign In */}
      <Button 
        onClick={handleGoogleSignIn} 
        disabled={isSubmitting}
        variant="outline"
        className="w-full flex items-center justify-center gap-3"
      >
        {isSubmitting ? (
          <LoaderCircle className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative flex items-center justify-center py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative px-4 bg-background">
          <span className="text-[16px] text-muted-foreground">or</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <Input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Please enter a valid email'
                }
              })}
              type="email"
              placeholder="Enter email address"
              className={cn(
                errors.email && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
              )}
            />
            {errors.email && (
              <p className="text-[14px] font-medium text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={cn(
                  "pr-12",
                  errors.password && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[14px] font-medium text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Input
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                className={cn(
                  "pr-12",
                  errors.confirmPassword && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[14px] font-medium text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <LoaderCircle className="w-5 h-5 animate-spin" />
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {/* Sign in link */}
      <div className="text-center pt-4">
        <Link 
          to="/auth" 
          className="text-[16px] text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
};
