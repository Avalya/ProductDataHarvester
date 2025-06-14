import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  country: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Italy", "Spain",
  "Netherlands", "Sweden", "Norway", "Denmark", "Switzerland", "Japan", "South Korea", "Singapore",
  "Hong Kong", "India", "China", "Brazil", "Mexico", "Argentina", "Russia", "Poland", "Czech Republic",
  "Other"
];

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const register = useRegister();
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      name: "",
      country: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register.mutateAsync(data);
      toast({
        title: "Registration Successful",
        description: "Welcome to AI Career Navigator! Redirecting to dashboard...",
      });
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass-card w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
          <UserPlus className="w-6 h-6 text-green-400" />
          <span>Create Account</span>
        </CardTitle>
        <p className="text-gray-400">Join AI Career Navigator today</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your full name"
                      className="glass-card border-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="glass-card border-none focus:ring-2 focus:ring-green-400 text-white">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass-card border-white/20">
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        placeholder="Create a password (8+ characters)"
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="glass-card border-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              disabled={register.isPending}
            >
              {register.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Button
              variant="link"
              onClick={onSwitchToLogin}
              className="text-green-400 hover:text-green-300 p-0"
            >
              Sign in here
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}