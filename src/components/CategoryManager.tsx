import React, { useState } from "react";
import { useExpense } from "@/context/ExpenseContext";
import { Category } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const colorOptions = [
  "#FF5A5F",
  "#63C4A5",
  "#36A2EB",
  "#FFC857",
  "#9E7DC5",
  "#FF9F40",
  "#4BC0C0",
  "#5D5C61",
  "#7395AE",
  "#557A95",
];

const CategoryManager: React.FC = () => {
  const { state, addCategory, updateCategory, deleteCategory } = useExpense();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [color, setColor] = useState(colorOptions[0]);
  const [icon, setIcon] = useState("");

  const [error, setError] = useState("");

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setName(category.name);
    setColor(category.color);
    setIcon(category.icon);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDeleteDialogOpen(true);
  };

  const handleAddOrUpdate = () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    if (categoryToEdit) {
      updateCategory({
        ...categoryToEdit,
        name,
        color,
        icon: icon || "tag",
      });
    } else {
      addCategory({
        name,
        color,
        icon: icon || "tag",
      });
    }

    resetForm();
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const resetForm = () => {
    setName("");
    setColor(colorOptions[0]);
    setIcon("");
    setError("");
    setCategoryToEdit(null);
    setIsAddDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Categories</h2>
          <p className="text-muted-foreground">
            Manage your expense categories
          </p>
        </div>

        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.categories.map((category) => (
          <div
            key={category.id}
            className="glass-card rounded-lg p-4 hover:shadow-md transition-shadow animate-scale-in"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: category.color }}
                >
                  <span className="text-white text-sm">
                    {category.name.substring(0, 2)}
                  </span>
                </div>

                <h3 className="font-medium">{category.name}</h3>
              </div>

              <div className="flex gap-1">
               {!category.isDefault ? (<>
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button></>) : <></> }
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {categoryToEdit ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Food & Dining"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full border-2",
                      color === colorOption
                        ? "border-primary"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: colorOption }}
                    onClick={() => setColor(colorOption)}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleAddOrUpdate}>
              {categoryToEdit ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category. Are you sure you want
              to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryManager;
