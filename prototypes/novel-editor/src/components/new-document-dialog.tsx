import { useState } from "react";
import { FileText } from "lucide-react";
import {
  documentTemplates,
  type DocumentTemplateType,
} from "@/lib/document-templates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { ChoiceField } from "./form-fields";
export function NewDocumentDialog({
  open,
  onOpenChange,
  initialLocale,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLocale: string;
  onCreate: (type: DocumentTemplateType, locale: string) => void;
}) {
  const [locale, setLocale] = useState(
    ["zh", "ja", "en"].includes(initialLocale) ? initialLocale : "zh",
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>新建词条</DialogTitle>
          <DialogDescription>
            选择你要写的内容。先写正文，资料可在属性面板继续完善。
          </DialogDescription>
        </DialogHeader>
        <ChoiceField
          label="写作语言"
          value={locale}
          onChange={setLocale}
          options={[
            ["zh", "简体中文"],
            ["ja", "日文"],
            ["en", "英文"],
          ]}
          description="繁体页面由简体原文生成，无需重复填写。"
        />
        <div
          className="grid min-h-0 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3"
          aria-label="选择词条类型"
        >
          {documentTemplates.map((template) => (
            <Button
              key={template.type}
              variant="outline"
              className="h-auto min-h-24 items-start justify-start whitespace-normal p-3 text-left"
              aria-label={`新建${template.label}`}
              onClick={() => onCreate(template.type, locale)}
            >
              <FileText className="mt-1 shrink-0" />
              <span>
                <strong className="block">{template.label}</strong>
                <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">
                  {template.description}
                </span>
              </span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          草稿自动保存在当前浏览器中。提交审核前，可以继续补全资料。
        </p>
      </DialogContent>
    </Dialog>
  );
}
