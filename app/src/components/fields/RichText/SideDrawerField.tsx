import { ISideDrawerFieldProps } from "@src/components/fields/types";
import RichTextEditor from "@src/components/RichTextEditor";
import { getFieldId } from "@src/components/SideDrawer/utils";

export default function RichText({
  column,
  value,
  onChange,
  onSubmit,
  disabled,
  _hanzo_ref,
}: ISideDrawerFieldProps) {
  return (
    <RichTextEditor
      disabled={disabled}
      value={value}
      onChange={onChange}
      onBlur={onSubmit}
      id={getFieldId(column.key)}
      _hanzo_ref={_hanzo_ref}
      column={column}
    />
  );
}
