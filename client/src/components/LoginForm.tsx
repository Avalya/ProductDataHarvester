import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login.mutateAsync(data);
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to dashboard...",
      });
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error?.message || "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass-card w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
          <LogIn className="w-6 h-6 text-green-400" />
          <span>Sign In</span>
        </CardTitle>
        <p className="text-gray-400">Access your AI Career Navigator</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      className="glass-card border-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="glass-card border-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full ai-gradient hover:scale-105 transition-all duration-300 ai-glow"
              disabled={login.isPending}
            >
              {login.isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <Button
              variant="link"
              onClick={onSwitchToRegister}
              className="text-green-400 hover:text-green-300 p-0"
            >
              Sign up here
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}