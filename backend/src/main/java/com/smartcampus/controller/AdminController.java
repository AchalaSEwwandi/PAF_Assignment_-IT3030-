package com.smartcampus.controller;

import com.smartcampus.dto.RoleRequest;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/users/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveUser(@PathVariable Long id, @RequestBody RoleRequest roleRequest) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }

            user.setStatus(User.Status.ACTIVE);
            user.setRole(roleRequest.getRole());
            userRepository.save(user);

            return ResponseEntity.ok("User approved successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to approve user: " + e.getMessage());
        }
    }

    @PutMapping("/users/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }

            user.setStatus(User.Status.REJECTED);
            userRepository.save(user);

            return ResponseEntity.ok("User rejected successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to reject user: " + e.getMessage());
        }
    }
}
