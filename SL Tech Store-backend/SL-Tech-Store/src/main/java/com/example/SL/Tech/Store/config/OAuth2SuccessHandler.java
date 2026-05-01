package com.example.SL.Tech.Store.config;

import com.example.SL.Tech.Store.model.User;
import com.example.SL.Tech.Store.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.cors.allowed-origins}")
    private String frontendUrl;

    public OAuth2SuccessHandler(UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String googleId = oAuth2User.getAttribute("sub");

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

        // Update Google ID if not set
        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
            user.setAvatar(picture);
            userRepository.save(user);
        }

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        // Redirect to frontend with token
        String redirectUrl = frontendUrl + "/oauth2/callback?token=" + token +
                "&name=" + user.getName() + "&role=" + user.getRole().name();
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
