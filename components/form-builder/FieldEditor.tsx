'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Settings2,
  ListPlus,
  Wrench,
  ChevronRight,
  ChevronDown as ChevronDownIcon,
} from 'lucide-react';
import { IFormField } from '@/models/FormTemplate';

interface FieldEditorProps {
  fields: IFormField[];
  onChange: (fields: IFormField[]) => void;
}

const FIELD_TYPES: { label: string; value: IFormField['type'] }[] = [
  { label: 'Single Line Text', value: 'text' },
  { label: 'Email Input', value: 'email' },
  { label: 'Multi-Line Textarea', value: 'textarea' },
  { label: 'Dropdown Select', value: 'select' },
  { label: 'Multiple Checkbox Options / Boolean', value: 'checkbox' },
  { label: 'Radio Button Group', value: 'radio' },
  { label: 'File Upload Attachment', value: 'file' },
];

export default function FieldEditor({ fields, onChange }: FieldEditorProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const handleAddField = () => {
    const idNum = fields.length + 1;
    const newField: IFormField = {
      id: `customField_${idNum}`,
      type: 'text',
      label: `Custom Field ${idNum}`,
      placeholder: 'Enter text...',
      required: false,
      validation: {},
      options: ['Option 1', 'Option 2'],
    };
    onChange([...fields, newField]);
    setActiveAccordion(newField.id);
  };

  const handleRemoveField = (index: number) => {
    const updated = [...fields];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const handleUpdateField = (index: number, updates: Partial<IFormField>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates } as IFormField;
    onChange(updated);
  };

  const handleUpdateValidation = (index: number, validationUpdates: Partial<IFormField['validation']>) => {
    const updated = [...fields];
    updated[index] = {
      ...updated[index],
      validation: { ...updated[index].validation, ...validationUpdates },
    };
    onChange(updated);
  };

  const handleAddOption = (fieldIndex: number) => {
    const field = fields[fieldIndex];
    const currentOptions = field.options || [];
    const newOption = `Option ${currentOptions.length + 1}`;
    handleUpdateField(fieldIndex, { options: [...currentOptions, newOption] });
  };

  const handleUpdateOption = (fieldIndex: number, optionIndex: number, val: string) => {
    const field = fields[fieldIndex];
    const updatedOptions = [...(field.options || [])];
    updatedOptions[optionIndex] = val;
    handleUpdateField(fieldIndex, { options: updatedOptions });
  };

  const handleRemoveOption = (fieldIndex: number, optionIndex: number) => {
    const field = fields[fieldIndex];
    const updatedOptions = [...(field.options || [])];
    updatedOptions.splice(optionIndex, 1);
    handleUpdateField(fieldIndex, { options: updatedOptions });
  };

  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="flex justify-between items-center bg-white/50 backdrop-blur p-4 rounded-2xl border border-neutral-200/50 shadow-sm mb-2">
        <div>
          <h3 className="text-sm font-bold text-neutral-800">Form Structure</h3>
          <p className="text-xs text-neutral-400">{fields.length} Fields configured</p>
        </div>
        <Button
          size="sm"
          onClick={handleAddField}
          className="rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
        >
          <Plus className="w-4 h-4" /> Add Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-10 px-4 border-2 border-dashed border-neutral-200 rounded-2xl">
          <p className="text-sm text-neutral-500 font-medium">No fields in the form yet.</p>
          <p className="text-xs text-neutral-400 mt-1">Click &quot;Add Field&quot; to begin designing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, idx) => {
            const isOpen = activeAccordion === field.id;
            
            return (
              <Card
                key={field.id}
                className={`overflow-hidden transition-all duration-300 border bg-white ${
                  isOpen
                    ? 'border-brand-orange/40 ring-2 ring-brand-orange/10 shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-300 shadow-2xs'
                }`}
              >
                {/* Field Accordion Trigger Header */}
                <div
                  className="flex items-center justify-between p-3.5 cursor-pointer select-none"
                  onClick={() => toggleAccordion(field.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-neutral-400 font-mono w-4">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="text-left">
                      <div className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                        {field.label || 'Unnamed Field'}
                        {field.required && (
                          <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0 rounded bg-rose-50 text-rose-600 border-rose-100">
                            Req
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] font-medium tracking-wide uppercase px-1 py-0 bg-neutral-100/80 text-neutral-500 rounded border border-neutral-200/20">
                          {field.type}
                        </Badge>
                        <span className="text-[10px] font-mono text-neutral-400">({field.id})</span>
                      </div>
                    </div>
                  </div>

                  {/* Reordering & Control Actions */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={idx === 0}
                      onClick={() => handleMoveField(idx, 'up')}
                      className="w-7 h-7 rounded-lg text-neutral-400 hover:text-neutral-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={idx === fields.length - 1}
                      onClick={() => handleMoveField(idx, 'down')}
                      className="w-7 h-7 rounded-lg text-neutral-400 hover:text-neutral-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveField(idx)}
                      className="w-7 h-7 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="text-neutral-300 px-0.5">|</div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleAccordion(field.id)}
                      className={`w-7 h-7 rounded-lg transition-colors cursor-pointer ${
                        isOpen ? 'bg-brand-orange/10 text-brand-orange' : 'text-neutral-400 hover:text-neutral-600'
                      }`}
                    >
                      {isOpen ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Collapsible Panel */}
                {isOpen && (
                  <div className="border-t border-neutral-100 bg-neutral-50/40 p-4 space-y-4 text-left animate-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Field ID (Unique) */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-neutral-500">Unique Variable ID</Label>
                        <Input
                          type="text"
                          value={field.id}
                          onChange={(e) => {
                            const newId = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                            handleUpdateField(idx, { id: newId });
                          }}
                          className="h-8 rounded-xl border-neutral-200 text-xs font-mono"
                        />
                      </div>

                      {/* Field Type */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-neutral-500">Input Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(val) => handleUpdateField(idx, { type: val as IFormField['type'] })}
                        >
                          <SelectTrigger className="h-8 rounded-xl border-neutral-200 text-xs bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {FIELD_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value} className="text-xs">
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Label Text */}
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-neutral-500">Field Label</Label>
                        <Input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleUpdateField(idx, { label: e.target.value })}
                          className="h-8 rounded-xl border-neutral-200 text-xs"
                        />
                      </div>

                      {/* Placeholder Text */}
                      {['text', 'email', 'textarea', 'select', 'file'].includes(field.type) && (
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-neutral-500">Placeholder Text</Label>
                          <Input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) => handleUpdateField(idx, { placeholder: e.target.value })}
                            className="h-8 rounded-xl border-neutral-200 text-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Checkbox Options, Select Dropdown, Radio Options */}
                    {['select', 'radio', 'checkbox'].includes(field.type) && (
                      <div className="space-y-2 border border-neutral-200/50 bg-white/70 p-3 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                            <ListPlus className="w-3.5 h-3.5 text-neutral-500" /> Option Choices
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddOption(idx)}
                            className="h-6 rounded-lg text-[10px] font-semibold text-violet-600 hover:text-violet-700 hover:bg-violet-50/50 cursor-pointer px-1.5"
                          >
                            + Add Option
                          </Button>
                        </div>
                        {(!field.options || field.options.length === 0) ? (
                          <p className="text-[10px] text-neutral-400 italic">No options defined.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {field.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-1.5">
                                <Input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                                  className="h-7 rounded-lg border-neutral-200 text-xs flex-1"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleRemoveOption(idx, optIdx)}
                                  className="w-7 h-7 rounded-lg text-neutral-400 hover:text-rose-500 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Validation Accordion section */}
                    <div className="space-y-3 pt-2 border-t border-neutral-100">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="text-xs font-bold text-neutral-700">Rules & Validations</span>
                      </div>

                      <div className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`req-${field.id}`}
                          checked={field.required}
                          onCheckedChange={(checked) => handleUpdateField(idx, { required: !!checked })}
                        />
                        <Label htmlFor={`req-${field.id}`} className="text-xs font-semibold text-neutral-600 cursor-pointer">
                          Mandatory / Required Field
                        </Label>
                      </div>

                      {['text', 'textarea'].includes(field.type) && (
                        <div className="grid grid-cols-2 gap-3 pl-1">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-neutral-500">Min Character Length</Label>
                            <Input
                              type="number"
                              value={field.validation?.minLength || ''}
                              onChange={(e) =>
                                handleUpdateValidation(idx, {
                                  minLength: e.target.value ? parseInt(e.target.value) : undefined,
                                })
                              }
                              className="h-7 rounded-lg border-neutral-200 text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-neutral-500">Max Character Length</Label>
                            <Input
                              type="number"
                              value={field.validation?.maxLength || ''}
                              onChange={(e) =>
                                handleUpdateValidation(idx, {
                                  maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                                })
                              }
                              className="h-7 rounded-lg border-neutral-200 text-xs"
                            />
                          </div>

                          <div className="col-span-2 space-y-1">
                            <Label className="text-[10px] font-semibold text-neutral-500">Custom Regex Validation Pattern</Label>
                            <Input
                              type="text"
                              placeholder="e.g. ^[A-Z]{3}$"
                              value={field.validation?.pattern || ''}
                              onChange={(e) =>
                                handleUpdateValidation(idx, { pattern: e.target.value || undefined })
                              }
                              className="h-7 rounded-lg border-neutral-200 text-xs font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
