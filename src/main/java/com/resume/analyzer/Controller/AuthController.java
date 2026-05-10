package com.resume.analyzer.Controller;

import com.resume.analyzer.Model.User;
import com.resume.analyzer.Repository.UserRepository;
import com.resume.analyzer.Services.JwtService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Neural Auth Engine: ONLINE");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (userRepository.findByUsername(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(new AuthResponse(null, "This email is already registered."));
            }

            User user = new User();
            user.setUsername(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setName(request.getName());
            user.setRole(User.Role.USER);
            userRepository.save(user);

            String jwtToken = jwtService.generateToken(user);
            return ResponseEntity.ok(new AuthResponse(jwtToken, "User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new AuthResponse(null, "Neural Link Error: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        java.util.Optional<User> userOpt = userRepository.findByUsername(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new AuthResponse(null, "User not found. Please register first."));
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            User user = userOpt.get();
            String jwtToken = jwtService.generateToken(user);
            return ResponseEntity.ok(new AuthResponse(jwtToken, "Login successful"));
            
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new AuthResponse(null, "Invalid credentials. Either email or password is wrong."));
        }
    }
}

@Data @NoArgsConstructor @AllArgsConstructor
class AuthRequest {
    private String email;
    private String password;
}

@Data @NoArgsConstructor @AllArgsConstructor
class RegisterRequest {
    private String name;
    private String email;
    private String password;
}

@Data @NoArgsConstructor @AllArgsConstructor
class AuthResponse {
    private String token;
    private String message;
}
