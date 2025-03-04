import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await signUp(email, password);
      navigate("/transactions"); // Redirect after registration
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm p-6 shadow-lg rounded-lg bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Register</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Email" 
            className="w-full focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none border border-gray-300 focus:border-gray-500"
          />
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" 
            className="w-full focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none border border-gray-300 focus:border-gray-500"
          />
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button onClick={handleRegister} className="w-full">
            Register
          </Button>
          <p className="text-sm text-center text-gray-500">
            Already have an account?  
            <a href="/login" className="ml-1 text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
