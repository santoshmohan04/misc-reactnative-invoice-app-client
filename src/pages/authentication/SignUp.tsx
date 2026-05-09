import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from 'tamagui';
import { registerSchema, type RegisterFormData } from '@store/../types/schemas';
import { useRegisterMutation } from '@store/apis/authApi';
import { useAppDispatch, useAuth } from '@store/hooks';
import { setError as setAuthError } from '@store/slices/authSlice';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
};

type SignUpScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SignUp'
>;

/**
 * Modern SignUp component using react-hook-form
 * Replaces legacy redux-form SignUp.js
 */
function SignUp() {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isAuthenticated, error: authError } = useAuth();
  
  const [register, { isLoading, error: registerError }] = useRegisterMutation();
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Redirect to main screen if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate('Main');
    }
  }, [isAuthenticated, navigation]);

  // Handle form submission
  const onSubmit = async (data: RegisterFormData) => {
    try {
      dispatch(setAuthError(null));
      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...registerData } = data;
      await register(registerData).unwrap();
      // Navigation happens automatically via useEffect when isAuthenticated changes
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Registration failed. Please try again.';
      dispatch(setAuthError(errorMessage));
    }
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const apiErrorMessage =
    registerError && 'data' in registerError
      ? ((registerError.data as { message?: string } | undefined)?.message ?? null)
      : null;
  const displayError = authError || apiErrorMessage || null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Header */}
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us to get started</Text>

          {/* Error Message */}
          {displayError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange } }) => (
                <View>
                  <Text style={styles.input}>{value}</Text>
                  {errors.name && (
                    <Text style={styles.fieldError}>
                      {errors.name.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange } }) => (
                <View>
                  <Text style={styles.input}>{value}</Text>
                  {errors.email && (
                    <Text style={styles.fieldError}>
                      {errors.email.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange } }) => (
                <View>
                  <Text style={styles.input}>{value}</Text>
                  {errors.password && (
                    <Text style={styles.fieldError}>
                      {errors.password.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { value, onChange } }) => (
                <View>
                  <Text style={styles.input}>{value}</Text>
                  {errors.confirmPassword && (
                    <Text style={styles.fieldError}>
                      {errors.confirmPassword.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Sign Up Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={styles.signUpButton}
            backgroundColor={isLoading ? '#999' : '#27AE60'}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </Button>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Text
              style={styles.loginLink}
              onPress={handleLoginPress}
            >
              Sign in
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEE',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 13,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  fieldError: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
  },
  signUpButton: {
    marginTop: 20,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 6,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 13,
    color: '#666',
  },
  loginLink: {
    fontSize: 13,
    color: '#1E90FF',
    fontWeight: '600',
  },
});

export default SignUp;
