package com.example.SL.Tech.Store.service.impl;

import com.example.SL.Tech.Store.config.JwtTokenProvider;
import com.example.SL.Tech.Store.dto.*;
import com.example.SL.Tech.Store.exception.ResourceNotFoundException;
import com.example.SL.Tech.Store.model.User;
import com.example.SL.Tech.Store.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserServiceImpl {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                           JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(User.Role.USER);
        user.setCreatedAt(LocalDateTime.now());

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return new AuthResponse(token, refreshToken, user.getId(), user.getName(),
                user.getEmail(), user.getAvatar(), user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return new AuthResponse(token, refreshToken, user.getId(), user.getName(),
                user.getEmail(), user.getAvatar(), user.getRole());
    }

    public AuthResponse googleLogin(String accessToken) {
        // Call Google's userinfo API with the access_token from frontend
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String url = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + accessToken;

            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> userInfo = restTemplate.getForObject(url, java.util.Map.class);

            if (userInfo == null || userInfo.get("email") == null) {
                throw new IllegalArgumentException("Invalid Google token");
            }

            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String picture = (String) userInfo.get("picture");
            String googleId = (String) userInfo.get("sub");

            // Find or create user
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(email);
                        newUser.setName(name);
                        newUser.setAvatar(picture);
                        newUser.setGoogleId(googleId);
                        newUser.setRole(User.Role.USER);
                        newUser.setCreatedAt(LocalDateTime.now());
                        return userRepository.save(newUser);
                    });

            // Update avatar/googleId if needed
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user.setAvatar(picture);
                userRepository.save(user);
            }

            String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
            String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

            return new AuthResponse(token, refreshToken, user.getId(), user.getName(),
                    user.getEmail(), user.getAvatar(), user.getRole());
        } catch (Exception e) {
            throw new IllegalArgumentException("Google authentication failed: " + e.getMessage());
        }
    }

    public User getProfile(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User updateProfile(String userId, String name, String phone) {
        User user = getProfile(userId);
        if (name != null) user.setName(name);
        if (phone != null) user.setPhone(phone);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User addAddress(String userId, User.Address address) {
        User user = getProfile(userId);
        address.setId(UUID.randomUUID().toString());

        if (address.isDefault() || user.getAddresses().isEmpty()) {
            user.getAddresses().forEach(a -> a.setDefault(false));
            address.setDefault(true);
        }

        user.getAddresses().add(address);
        return userRepository.save(user);
    }

    public User removeAddress(String userId, String addressId) {
        User user = getProfile(userId);
        user.getAddresses().removeIf(a -> a.getId().equals(addressId));
        return userRepository.save(user);
    }

    public User updateAddress(String userId, String addressId, User.Address updatedAddress) {
        User user = getProfile(userId);
        for (int i = 0; i < user.getAddresses().size(); i++) {
            User.Address a = user.getAddresses().get(i);
            if (a.getId().equals(addressId)) {
                updatedAddress.setId(addressId);
                if (updatedAddress.isDefault()) {
                    user.getAddresses().forEach(addr -> addr.setDefault(false));
                }
                user.getAddresses().set(i, updatedAddress);
                break;
            }
        }
        return userRepository.save(user);
    }

    public User addPaymentMethod(String userId, User.SavedPaymentMethod paymentMethod) {
        User user = getProfile(userId);
        paymentMethod.setId(UUID.randomUUID().toString());

        if (paymentMethod.isDefault() || user.getPaymentMethods().isEmpty()) {
            user.getPaymentMethods().forEach(p -> p.setDefault(false));
            paymentMethod.setDefault(true);
        }

        user.getPaymentMethods().add(paymentMethod);
        return userRepository.save(user);
    }

    public User removePaymentMethod(String userId, String paymentMethodId) {
        User user = getProfile(userId);
        user.getPaymentMethods().removeIf(p -> p.getId().equals(paymentMethodId));
        return userRepository.save(user);
    }

    // Wishlist operations
    public User addToWishlist(String userId, String productId) {
        User user = getProfile(userId);
        if (!user.getWishlist().contains(productId)) {
            user.getWishlist().add(productId);
            userRepository.save(user);
        }
        return user;
    }

    public User removeFromWishlist(String userId, String productId) {
        User user = getProfile(userId);
        user.getWishlist().remove(productId);
        return userRepository.save(user);
    }

    // Admin operations
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserRole(String userId, User.Role role) {
        User user = getProfile(userId);
        user.setRole(role);
        return userRepository.save(user);
    }

    public void pingUser(String userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastSeenAt(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    public LocalDateTime getUserLastSeen(String userId) {
        return userRepository.findById(userId)
                .map(User::getLastSeenAt)
                .orElse(null);
    }

    public LocalDateTime getAdminLastSeen() {
        return userRepository.findByRole(User.Role.ADMIN).stream()
                .map(User::getLastSeenAt)
                .filter(java.util.Objects::nonNull)
                .max(java.time.LocalDateTime::compareTo)
                .orElse(null);
    }
}
