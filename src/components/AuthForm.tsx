import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { FcGoogle } from "react-icons/fc"; // Placeholder Google icon

const AuthForm = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      if (isRegister) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      navigate("/"); // Redirect after login or register
    } catch (error) {
      console.error(`${isRegister ? "Register" : "Login"} error:`, error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm p-6 shadow-lg rounded-lg bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">
            {isRegister ? "Register" : "Login"}
          </CardTitle>
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
          <Button onClick={handleSubmit} className="w-full">
            {isRegister ? "Register" : "Login"}
          </Button>
          <Button 
            onClick={signInWithGoogle} 
            variant="outline" 
            className="w-full flex items-center justify-center space-x-2"
          >
            <FcGoogle className="text-xl" />
            <span>Sign in with Google</span>
          </Button>
          <p className="text-sm text-center text-gray-500">
            {isRegister ? "Already have an account?" : "Don't have an account?"}  
            <button 
              onClick={() => setIsRegister(!isRegister)} 
              className="ml-1 text-blue-600 hover:underline"
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;
