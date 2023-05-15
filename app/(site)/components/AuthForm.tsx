'use client';
import { useCallback, useEffect, useState } from "react";
import {FieldValues, useForm, SubmitHandler} from "react-hook-form"
import Input from "./inputs/Input";
import Button from "./Button";
import AuthSocialButton from "./AuthSocialButton";
import { BsGoogle } from 'react-icons/bs'
import axios from "axios";
import {toast} from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Variant = 'LOGIN' | 'REGISTER' ;

const AuthForm = () => {
    const session = useSession();
    const router = useRouter();
    const [variant, setVariant] = useState<Variant>('LOGIN');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (session?.status === 'authenticated'){
            router.push('/users')
        }
    }, [session?.status, router]);

    const toggleVariant = useCallback(() =>{
        if(variant === 'LOGIN'){
            setVariant('REGISTER');
        }else{
            setVariant('LOGIN');
        }
    }, [variant])

    const {
        register,
        handleSubmit,
        formState:{
            errors
        }
    } = useForm<FieldValues>({
        defaultValues:{
            name: '',
            email:'',
            password: ''
        }
    });

    const onSubmit: SubmitHandler<FieldValues> = (data) =>{
        setIsLoading(true);

        if (variant === 'REGISTER') {
            axios.post('/api/register', data)
            .then(() => signIn('credentials', data))
            .catch(() => toast.error('Something went wrong'))
            .finally(() => setIsLoading(false))
            
          }

          if (variant === 'LOGIN') {
            signIn('credentials', {
                ...data,
                redirect: false
            })
            .then((callback) => {
                if (callback?.error){
                    toast.error('Mauvais identifiants')
                }
                if (callback?.ok && !callback?.error){
                    toast.success('Connecté')
                    router.push('/users')
                }
            })
            .finally(() => setIsLoading(false));
            
          }
    }

    const socialAction = (action: string)=>{
        setIsLoading(true);
        // signIn(action, { redirect: false})
        // .then((callback => {
        //     if (callback?.error){
        //         toast.error('Mauvais identifiants')
        //     }
        //     if (callback?.ok && !callback?.error){
        //         toast.success('Connecté')
        //     }
        // }))
        // .finally(() => setIsLoading(false));
       
    }

    return(
        <div className="mt-8 sm:mx-auto sm:max-w-md sm:w-full">
            <div className="bg-white px-6 py-8 shadow sm:rounded-lg sm:px-10">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {variant ==='REGISTER' && (
                        <Input id="name" label="Nom" register={register} errors={errors} disabled={isLoading}/>
                    )}

                    <Input id="email" type="email" label="Adresse mail" register={register} errors={errors} disabled={isLoading}/>
                    <Input id="password" type="password" label="Mot de passe" register={register} errors={errors} disabled={isLoading}/>
                    <div>
                        <Button disabled={isLoading} fullWidth type="submit">{variant === 'LOGIN' ? 'Se connecter' : "S'inscrire"}</Button>
                    </div>
                </form>
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="text-gray-500 bg-white px-2">
                                Ou continuer avec
                            </span>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-2">
                        <AuthSocialButton icon={BsGoogle} onClick={() => socialAction('google')}></AuthSocialButton>
                    </div>
                </div>
                <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
                    <div>
                        {variant === 'LOGIN' ? 'Nouveau sur Messenger ?' : 'Déjà un compte ?'}
                    </div>
                    <div onClick={toggleVariant} className="underline cursor-pointer">
                        {variant === 'LOGIN' ? 'Créer un compte' : 'Se connecter'}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthForm;