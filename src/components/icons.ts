// Material Design icon set (react-icons/md), re-exported under the same
// names the app already uses everywhere. Swapping icon libraries is just a
// matter of pointing each file's `from 'lucide-react'` import at this file
// instead — no JSX usage sites need to change.
//
// The `as any` casts below aren't a shortcut: this project has no
// @types/react installed, so react-icons' prop types (which extend
// React.SVGAttributes<SVGElement>) can't resolve className at all — the same
// gap silently affects every other React type in this codebase already
// (nothing else here happens to extend an SVGAttributes-shaped type, so it
// never surfaced before). Casting matches how the rest of the app already
// behaves under the hood.
import * as Md from 'react-icons/md';

export const User = Md.MdPerson as any;
export const LogOut = Md.MdLogout as any;
export const Search = Md.MdSearch as any;
export const Plus = Md.MdAdd as any;
export const Moon = Md.MdDarkMode as any;
export const Sun = Md.MdLightMode as any;
export const CheckSquare = Md.MdCheckBox as any;
export const Calendar = Md.MdCalendarToday as any;
export const Layers = Md.MdLayers as any;
export const FolderKanban = Md.MdViewKanban as any;
export const Pin = Md.MdPushPin as any;
export const PinOff = Md.MdOutlinePushPin as any;
export const CheckCircle2 = Md.MdCheckCircle as any;
export const ListFilter = Md.MdFilterList as any;
export const Cloud = Md.MdCloud as any;
export const Sparkles = Md.MdAutoAwesome as any;
export const Inbox = Md.MdInbox as any;
export const Palette = Md.MdPalette as any;
export const Download = Md.MdDownload as any;
export const Clock = Md.MdSchedule as any;
export const AlertTriangle = Md.MdWarningAmber as any;
export const Sliders = Md.MdTune as any;
export const Filter = Md.MdFilterAlt as any;
export const X = Md.MdClose as any;
export const Check = Md.MdCheck as any;
export const Trash2 = Md.MdDeleteOutline as any;
export const Tag = Md.MdLabel as any;
export const AlertCircle = Md.MdErrorOutline as any;
export const Circle = Md.MdRadioButtonUnchecked as any;
export const MoreVertical = Md.MdMoreVert as any;
export const ChevronDown = Md.MdExpandMore as any;
export const ChevronUp = Md.MdExpandLess as any;
export const ChevronLeft = Md.MdChevronLeft as any;
export const ChevronRight = Md.MdChevronRight as any;
export const Edit3 = Md.MdEdit as any;
export const Briefcase = Md.MdWork as any;
