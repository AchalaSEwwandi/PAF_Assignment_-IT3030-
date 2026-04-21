package com.smartcampus.config;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");

        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;

        if (userOpt.isEmpty()) {
            // Create new user with STUDENT role and ACTIVE status (approved = true)
            user = new User();
            user.setEmail(email);
            user.setFullName(name);
            user.setUsername(email.split("@")[0]);
            user.setGoogleId(googleId);
            user.setRole(User.Role.STUDENT);
            user.setStatus(User.Status.ACTIVE); // approved = true
            user.setPasswordHash("OAUTH2_USER_" + UUID.randomUUID().toString());
            userRepository.save(user);
        } else {
            user = userOpt.get();
        }

        // Check if user is approved
        if (user.getStatus() == User.Status.PENDING) {
            response.sendRedirect("http://localhost:5173/pending");
            return;
        }

        // Generate JWT and redirect to callback
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        response.sendRedirect("http://localhost:5173/oauth2/callback?token=" + token);
    }
}
