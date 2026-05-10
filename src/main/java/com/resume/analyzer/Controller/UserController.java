package com.resume.analyzer.Controller;

import com.resume.analyzer.Model.User;
import com.resume.analyzer.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> user = userRepository.findByUsername(username);
        
        if (user.isPresent()) {
            User u = user.get();
            // Return only safe fields
            return ResponseEntity.ok(java.util.Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "name", u.getName(),
                "role", u.getRole()
            ));
        }
        
        return ResponseEntity.status(401).body("User not found in context");
    }
}
