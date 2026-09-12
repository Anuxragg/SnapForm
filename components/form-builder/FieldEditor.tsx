'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ListPlus,
  SlidersHorizontal,
  FileText,
  Hash,
  Type,
  Check,
  X,
} from 'lucide-react';
import { IFormField } from '@/models/FormTemplate';

interface FieldEditorProps {
  fields: IFormField[];
  onChange: (fields: IFormField[]) => void;
}

const FIELD_TYPES: { label: string; value: IFormField['type'] }[] = [
  { label: 'Single Line Text', value: 'text' },
  { label: 'Email Address', value: 'email' },
  { label: 'Multi-Line Textarea', value: 'textarea' },
  { label: 'Dropdown Select', value: 'select' },
  { label: 'Checkboxes / Multiple', value: 'checkbox' },
  { label: 'Radio Button Group', value: 'radio' },
  { label: 'File Attachment', value: 'file' },
];

export default function FieldEditor({ fields, onChange }: FieldEditorProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(
    fields.length > 0 ? fields[0].id : null
  );

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const handleAddField = () => {
    const idNum = fields.length + 1;
    const newField: IFormField = {
      id: `field_${idNum}`,
      type: 'text',
      label: `New Field ${idNum}`,
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
      <div className="flex justify-between items-center bg-white dark:bg-[#1C1C1C] px-4 py-3 rounded-2xl border border-neutral-200/80 dark:border-[#2a2a2a] shadow-xs">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-heading">
            Form Fields
          </h3>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
            {fields.length} {fields.length === 1 ? 'field' : 'fields'} configured
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleAddField}
          className="h-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-white font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer text-xs px-3 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Field</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-neutral-200 dark:border-[#2a2a2a] rounded-2xl bg-white dark:bg-[#1C1C1C] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-[#252525] flex items-center justify-center text-neutral-400 mx-auto">
            <FileText className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">No fields added yet</p>
          <p className="text-[11px] text-neutral-400">Click &ldquo;Add Field&rdquo; above to start adding fields.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {fields.map((field, idx) => {
            const isOpen = activeAccordion === field.id;

            return (
              <div
                key={field.id}
                className={`group rounded-2xl border transition-all duration-200 bg-white dark:bg-[#1C1C1C] overflow-hidden ${
                  isOpen
                    ? 'border-neutral-300 dark:border-[#383838] shadow-sm'
                    : 'border-neutral-200/90 dark:border-[#262626] hover:border-neutral-300 dark:hover:border-[#333333]'
                }`}
              >
                {/* Field Accordion Trigger Header */}
                <div
                  className="flex items-center justify-between px-3.5 py-3 cursor-pointer select-none transition-colors hover:bg-neutral-50/70 dark:hover:bg-[#222222]"
                  onClick={() => toggleAccordion(field.id)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Index Number */}
                    <span className="w-5 h-5 rounded-md bg-neutral-100 dark:bg-[#252525] text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 flex items-center justify-center shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    {/* Label and details */}
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {field.label || 'Unnamed Field'}
                        </span>
                        {field.required && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shrink-0">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-[#252525] text-neutral-600 dark:text-neutral-300 border border-neutral-200/60 dark:border-[#303030]">
                          {field.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveField(idx, 'up')}
                      className="w-6 h-6 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#282828] disabled:opacity-20 disabled:hover:bg-transparent flex items-center justify-center cursor-pointer transition-colors"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === fields.length - 1}
                      onClick={() => handleMoveField(idx, 'down')}
                      className="w-6 h-6 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#282828] disabled:opacity-20 disabled:hover:bg-transparent flex items-center justify-center cursor-pointer transition-colors"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveField(idx)}
                      className="w-6 h-6 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 flex items-center justify-center cursor-pointer transition-colors ml-0.5"
                      title="Delete Field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-6 h-6 rounded-lg text-neutral-400 flex items-center justify-center ml-0.5">
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-neutral-700 dark:text-neutral-200' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Collapsible Config Body */}
                {isOpen && (
                  <div className="border-t border-neutral-100 dark:border-[#262626] bg-neutral-50/50 dark:bg-[#181818] p-4 space-y-3.5 text-left animate-in fade-in duration-150">
                    {/* Row 1: Field Label + Field Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                          Field Label
                        </Label>
                        <Input
                          type="text"
                          value={field.label}
                          placeholder="e.g. Full Name"
                          onChange={(e) => {
                            const newLabel = e.target.value;
                            // Generate safe slug id if previous id was default field_X or derived
                            const slug = newLabel
                              .toLowerCase()
                              .trim()
                              .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
                              .replace(/[^a-zA-Z0-9_]/g, '');
                            const safeId = slug || field.id || `field_${idx + 1}`;
                            handleUpdateField(idx, { label: newLabel, id: safeId });
                          }}
                          className="h-8.5 rounded-xl border-neutral-200/90 dark:border-[#2c2c2c] bg-white dark:bg-[#1F1F1F] text-xs text-neutral-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                          Field Type
                        </Label>
                        <Select
                          value={field.type}
                          onValueChange={(val) => handleUpdateField(idx, { type: val as IFormField['type'] })}
                        >
                          <SelectTrigger className="h-8.5 rounded-xl border-neutral-200/90 dark:border-[#2c2c2c] text-xs bg-white dark:bg-[#1F1F1F] text-neutral-900 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl bg-white dark:bg-[#1F1F1F] border-neutral-200 dark:border-[#2c2c2c]">
                            {FIELD_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value} className="text-xs">
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Option Choices for Select, Radio, Checkbox */}
                    {['select', 'radio', 'checkbox'].includes(field.type) && (
                      <div className="space-y-2 rounded-xl bg-white dark:bg-[#1F1F1F] border border-neutral-200/80 dark:border-[#2c2c2c] p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                            <ListPlus className="w-3.5 h-3.5 text-neutral-400" />
                            Option Choices
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddOption(idx)}
                            className="text-[10px] font-semibold text-neutral-900 dark:text-white hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Option
                          </button>
                        </div>
                        {(!field.options || field.options.length === 0) ? (
                          <p className="text-[10px] text-neutral-400 italic py-1">No options defined.</p>
                        ) : (
                          <div className="space-y-1.5 pt-1">
                            {field.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-1.5">
                                <Input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                                  className="h-7.5 rounded-lg border-neutral-200/90 dark:border-[#2c2c2c] bg-neutral-50/50 dark:bg-[#181818] text-xs flex-1 text-neutral-900 dark:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(idx, optIdx)}
                                  className="w-7 h-7 rounded-lg text-neutral-400 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Validation & Rules Section */}
                    <div className="pt-2.5 border-t border-neutral-200/70 dark:border-[#282828] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="text-[11px] font-bold uppercase tracking-wider font-heading">
                            Validation Rules
                          </span>
                        </div>

                        {/* Required Checkbox Toggle */}
                        <label
                          htmlFor={`req-${field.id}`}
                          className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
                        >
                          <Checkbox
                            id={`req-${field.id}`}
                            checked={field.required}
                            onCheckedChange={(checked) => handleUpdateField(idx, { required: !!checked })}
                            className="rounded-md"
                          />
                          <span>Required</span>
                        </label>
                      </div>

                      {['text', 'textarea'].includes(field.type) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                              Min Character Length
                            </Label>
                            <Input
                              type="number"
                              value={field.validation?.minLength ?? ''}
                              placeholder="0"
                              onChange={(e) =>
                                handleUpdateValidation(idx, {
                                  minLength: e.target.value ? parseInt(e.target.value) : undefined,
                                })
                              }
                              className="h-8 rounded-xl border-neutral-200/90 dark:border-[#2c2c2c] bg-white dark:bg-[#1F1F1F] text-xs font-mono text-neutral-900 dark:text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                              Max Character Length
                            </Label>
                            <Input
                              type="number"
                              value={field.validation?.maxLength ?? ''}
                              placeholder="500"
                              onChange={(e) =>
                                handleUpdateValidation(idx, {
                                  maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                                })
                              }
                              className="h-8 rounded-xl border-neutral-200/90 dark:border-[#2c2c2c] bg-white dark:bg-[#1F1F1F] text-xs font-mono text-neutral-900 dark:text-white"
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-1">
                            <Label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                              Custom Regex Pattern
                            </Label>
                            <Input
                              type="text"
                              placeholder="e.g. ^[A-Za-z0-9_]+$"
                              value={field.validation?.pattern || ''}
                              onChange={(e) =>
                                handleUpdateValidation(idx, { pattern: e.target.value || undefined })
                              }
                              className="h-8 rounded-xl border-neutral-200/90 dark:border-[#2c2c2c] bg-white dark:bg-[#1F1F1F] text-xs font-mono text-neutral-900 dark:text-white placeholder:text-neutral-400"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
