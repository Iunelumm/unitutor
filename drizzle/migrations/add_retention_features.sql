-- Add session files table
CREATE TABLE IF NOT EXISTS `sessionFiles` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `sessionId` int NOT NULL,
  `uploaderId` int NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `fileUrl` varchar(500) NOT NULL,
  `fileSize` int NOT NULL,
  `fileType` varchar(50) NOT NULL,
  `description` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`uploaderId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Add session notes table
CREATE TABLE IF NOT EXISTS `sessionNotes` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `sessionId` int NOT NULL,
  `authorId` int NOT NULL,
  `authorRole` enum('student', 'tutor') NOT NULL,
  `content` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Add favorite tutors table
CREATE TABLE IF NOT EXISTS `favoriteTutors` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `studentId` int NOT NULL,
  `tutorId` int NOT NULL,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tutorId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_student_tutor` (`studentId`, `tutorId`)
);

-- Add indexes for better performance
CREATE INDEX `idx_sessionFiles_sessionId` ON `sessionFiles`(`sessionId`);
CREATE INDEX `idx_sessionFiles_uploaderId` ON `sessionFiles`(`uploaderId`);
CREATE INDEX `idx_sessionNotes_sessionId` ON `sessionNotes`(`sessionId`);
CREATE INDEX `idx_sessionNotes_authorId` ON `sessionNotes`(`authorId`);
CREATE INDEX `idx_favoriteTutors_studentId` ON `favoriteTutors`(`studentId`);
CREATE INDEX `idx_favoriteTutors_tutorId` ON `favoriteTutors`(`tutorId`);
