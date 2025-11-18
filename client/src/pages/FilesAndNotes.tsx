import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  BookOpen, 
  ArrowLeft, 
  FileText, 
  Download, 
  Search,
  Calendar,
  User,
  File,
  Image,
  FileSpreadsheet,
  Presentation
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useMemo } from "react";
import { formatDatePT } from "@shared/timezone";

// File type icon mapping
const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
  if (fileType.includes('image')) return <Image className="h-5 w-5 text-blue-500" />;
  if (fileType.includes('sheet') || fileType.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return <Presentation className="h-5 w-5 text-orange-500" />;
  return <File className="h-5 w-5 text-gray-500" />;
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function FilesAndNotes() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: files, isLoading } = trpc.sessionFiles.myFiles.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const allFiles = files || [];

  // Filter and search files
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return allFiles;
    
    const query = searchQuery.toLowerCase();
    return allFiles.filter(file => 
      file.fileName.toLowerCase().includes(query) ||
      file.course?.toLowerCase().includes(query) ||
      file.description?.toLowerCase().includes(query)
    );
  }, [allFiles, searchQuery]);

  // Group files by course
  const filesByCourse = useMemo(() => {
    const grouped: Record<string, typeof filteredFiles> = {};
    filteredFiles.forEach(file => {
      const course = file.course || "Other";
      if (!grouped[course]) {
        grouped[course] = [];
      }
      grouped[course].push(file);
    });
    return grouped;
  }, [filteredFiles]);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">{APP_TITLE}</h1>
          </Link>
          <Link href="/student">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Files & Notes</h2>
          <p className="text-muted-foreground">
            All your session files and materials in one place
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search files by name, course, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading files...</p>
            </CardContent>
          </Card>
        ) : allFiles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No files yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Files shared during sessions will appear here
              </p>
              <Link href="/student/sessions">
                <Button>View Sessions</Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredFiles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No files match your search</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(filesByCourse).map(([course, courseFiles]) => (
              <div key={course}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {course}
                  <Badge variant="secondary">{courseFiles.length} files</Badge>
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {courseFiles.map((file) => (
                    <Card key={file.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          {getFileIcon(file.fileType)}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">
                              {file.fileName}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatFileSize(file.fileSize)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {file.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {file.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {file.startTime ? formatDatePT(file.startTime) : "Unknown date"}
                        </div>

                        <div className="flex gap-2">
                          <a 
                            href={file.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button size="sm" className="w-full">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </a>
                          <Link href={`/student/sessions/${file.sessionId}`}>
                            <Button size="sm" variant="outline">
                              View Session
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {allFiles.length > 0 && (
          <Card className="mt-8">
            <CardContent className="py-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{allFiles.length}</p>
                  <p className="text-sm text-muted-foreground">Total Files</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{Object.keys(filesByCourse).length}</p>
                  <p className="text-sm text-muted-foreground">Courses</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {formatFileSize(allFiles.reduce((sum, f) => sum + f.fileSize, 0))}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Size</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
