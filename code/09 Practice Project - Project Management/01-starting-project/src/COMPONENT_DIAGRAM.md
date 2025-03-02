# React Component Diagram

```
                                    +-------------------+
                                    |       App         |
                                    | (Main State)      |
                                    +--------+----------+
                                             |
                    +------------------------+------------------------+
                    |                        |                        |
        +-----------v-----------+  +---------v---------+  +----------v-----------+
        | CategoriesSidebar     |  | NoCategorySelected |  | SelectedCategoryDetails |
        | (List of categories)  |  | (Welcome screen)   |  | (Category view)     |
        +-----------------------+  +-------------------+  +----------+-----------+
                                                                     |
                                                      +--------------|-------------+
                                                      |              |             |
                                           +----------v----+ +-------v------+ +----v-----------+
                                           | SubcategoryTabs| |  ItemForm    | |   ItemList     |
                                           | (Tab navigation)| | (Add items)  | | (Display items)|
                                           +---------------+ +-------+------+ +----+------------+
                                                                     |              |
                                                                     |        +-----v------+
                                                                     |        | CategoryItem|
                                                                     |        | (Single item)|
                                                                     |        +------------+
                                                                     |              |
                                                                     +--------------+
                                                                     |
                                                                     v
                                                              Data flows back up
                                                              to App via callbacks
```

## Component Hierarchy

- **App**: The root component that manages the main application state
  - **CategoriesSidebar**: Displays the list of categories
  - **NoCategorySelected**: Shown when no category is selected
  - **SelectedCategoryDetails**: Displays the details of a selected category
    - **SubcategoryTabs**: Navigation tabs for subcategories
    - **ItemForm**: Form for adding new items
    - **ItemList**: Displays the list of items
      - **CategoryItem**: Displays a single item

## Data Flow

1. **State Management**:
   - The main state is managed in the App component
   - Each component maintains local state for UI interactions

2. **Props Down**:
   - Data flows down from parent to child via props
   - Example: App passes the selected category to SelectedCategoryDetails

3. **Events Up**:
   - Child components communicate with parents via callback functions
   - Example: When an item is added in ItemForm, it calls a function passed from SelectedCategoryDetails

## Key React Concepts Demonstrated

### 1. Props and Prop Drilling

Props are passed down through multiple levels of components:
- App → SelectedCategoryDetails → ItemList → CategoryItem

This is known as "prop drilling" - passing props through intermediate components.

### 2. State Management

- **App**: Manages global state (categories, selected category)
- **SelectedCategoryDetails**: Manages local state (selected subcategory, editing mode)
- **ItemForm**: Manages form input state

### 3. Refs

Refs are used to directly access DOM elements:
- In ItemForm, a ref is used to access the input field value
- In NewEditCategory, refs are used to access form input values

### 4. Component Composition

The application is built from smaller, focused components:
- ItemList composes multiple CategoryItem components
- SelectedCategoryDetails composes SubcategoryTabs, ItemForm, and ItemList

### 5. Conditional Rendering

Components render different UI based on state:
- App renders different main content based on selection state
- ItemList renders either a list or an empty message
- SelectedCategoryDetails renders different subcategory views

### 6. Effect Hooks

useEffect is used to:
- Synchronize component state with props
- Reset selections when dependencies change
- Initialize default values 