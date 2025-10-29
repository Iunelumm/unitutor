import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { BookOpen, Scale } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-white">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">{APP_TITLE}</h1>
          </Link>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </header>

      <div className="container py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Scale className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Legal Disclaimer & Terms</h1>
        </div>

        {/* English Version */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">🧾 Disclaimer (English)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <p className="text-base">
              <strong>UniTutor</strong> is an independent, student-created web platform intended solely for academic networking and tutoring coordination among students of the University of California, Santa Barbara (UCSB).
            </p>
            <p className="text-base">
              By accessing or using this platform, you acknowledge and agree to the following:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-base mb-2">1. Independent Project</h3>
                <p>UniTutor is <strong>not affiliated with, sponsored by, or endorsed by</strong> UCSB or any of its departments.</p>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-2">2. No Financial Responsibility</h3>
                <p>UniTutor <strong>does not process or handle any payments</strong> between users. All tutoring arrangements, including scheduling, communication, and compensation, are conducted at the users' own discretion and risk.</p>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-2">3. User Conduct</h3>
                <p>Users are <strong>solely responsible</strong> for their behavior, communications, and any content shared on or off the platform. Any unlawful, harassing, discriminatory, or academically dishonest activity is strictly prohibited.</p>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-2">4. No Warranty or Liability</h3>
                <p>The platform and its administrators <strong>make no guarantees</strong> regarding tutor quality, academic outcomes, or user conduct. UniTutor and its creators shall not be held liable for any disputes, damages, losses, or claims arising from user interactions, including those occurring outside the platform.</p>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-2">5. Third-Party Responsibility</h3>
                <p>Users acknowledge that any external communication, meeting, or payment arrangement is <strong>entirely at their own risk</strong>.</p>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-2">6. Data Privacy</h3>
                <p>UniTutor collects only minimal user data necessary for operation. The platform <strong>does not share or sell</strong> personal information to third parties.</p>
              </div>
            </div>

            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="font-semibold text-red-900">⚠️ Legal Notice:</p>
              <p className="text-red-800 mt-2">
                UniTutor and its developers <strong>expressly disclaim any and all liability</strong> arising from the use or misuse of this platform. By registering, you accept that your participation is voluntary and that you assume full responsibility for your interactions and any resulting consequences.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Chinese Version */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🧾 免责声明（中文）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <p className="text-base">
              <strong>UniTutor</strong> 是由加州大学圣塔芭芭拉分校（UCSB）学生独立开发的学术互助平台，仅用于学生间的学业交流与辅导匹配。
            </p>
            <p className="text-base">
              使用本平台即表示您同意以下条款：
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-base mb-2">1. 独立性质</h3>
                <p>UniTutor 与 UCSB 及其任何部门 <strong>无隶属或官方合作关系</strong>。</p>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-2">2. 不承担财务责任</h3>
                <p>UniTutor <strong>不参与任何支付或资金流转</strong>。所有辅导安排（包括沟通、时间、报酬）均由用户自行决定并自行承担风险。</p>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-2">3. 用户行为责任自负</h3>
                <p>用户应对自身言行、沟通内容及在平台内外的行为负责。<strong>严禁从事违法、骚扰、歧视或学术不端行为</strong>。</p>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-2">4. 不保证、不承担责任</h3>
                <p>平台及其开发者 <strong>不保证</strong> 辅导质量、学习结果或用户行为。因使用平台产生的任何纠纷、损失或争议，UniTutor 及其开发者 <strong>不承担法律责任</strong>。</p>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-2">5. 第三方风险自担</h3>
                <p>用户在平台外的任何接触、交流或交易均由个人 <strong>自愿承担风险</strong>。</p>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-2">6. 数据隐私</h3>
                <p>平台仅收集最少的必要信息，<strong>不向第三方出售或泄露</strong>用户数据。</p>
              </div>
            </div>

            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="font-semibold text-red-900">⚠️ 法律声明：</p>
              <p className="text-red-800 mt-2">
                注册或使用本平台即代表您自愿参与并承担全部风险，UniTutor 对由此产生的任何后果 <strong>不承担法律责任</strong>。
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 UniTutor Project. All rights reserved.</p>
          <p className="mt-1">Not affiliated with UCSB.</p>
          <p className="mt-2 font-medium">For educational use only — UniTutor assumes no responsibility for off-platform interactions.</p>
        </div>
      </div>
    </div>
  );
}

